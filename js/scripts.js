const maskLoader = () =>{
    let $mask = document.querySelector(".mask");
    window.addEventListener('load', () => {
        setTimeout(() => {
            $mask.classList.remove('mask');
        }, 400)
    })
};

const urlPhone = 'https://dummyjson.com/products/category/smartphones';
const urlLaptop = 'https://dummyjson.com/products/category/laptops';

const getData = async (url) =>{
    try{
        const res = await fetch(url);
        const data = await res.json();
        return data;
    }catch (err){
        console.log(err)
    }
};

const sortedRating = async (listProducts) => {
    try{
        const data = await listProducts;
        const sortedData = data.sort((a, b) => b.rating - a.rating);
        return sortedData;
    } catch (err) {
        console.log(err)
    }
};

const sortedRelatedProducts = async (listProducts, productId) => {
    try{
        const data = await listProducts;
        const filterData = await data.filter(el => el.id != productId);
        const sortedData = await filterData.sort((a, b) => b.rating - a.rating);
        return sortedData;
    } catch (err) {
        console.log(err)
    }
};

const renderStarRating = (rating) => {
    const starBlock = document.createElement('div');
    starBlock.classList.add('d-flex', 'justify-content-center', 'small', 'mb-2', 'js-product-rating');
    for (let i = 0; i < 5; i++){
        const star = document.createElement('div');
        star.classList.add('bi', 'bi-star-fill');
        if (i+1 <= rating){
            star.classList.add('text-warning')
        }
        starBlock.insertAdjacentElement('beforeend', star)
    }
    return starBlock.outerHTML;
}

const randomImage = (product) => {
    const images = product.images;
    const img = images[Math.floor(Math.random()*images.length)];
    return img
}

const dataRelatedProducts = async (url) =>{
    const data = await getData(url);
    const id = data.id;
    if(data.category === "smartphones"){
        await catalogProductsRender(urlPhone, undefined, sortedRelatedProducts, 3, id);
    }else {
        await catalogProductsRender(urlLaptop, undefined, sortedRelatedProducts, 3, id);
    }
}

const catalogProductsRender = async (firstURL, secondURL, sortedProducts, quantity, productIdToRemove) =>{

    const unitHTML = document.querySelector ('.js-product-block');
    let products = await getData(firstURL);
    products = products.products;
    if (!!secondURL){
        const getDataAtSecondURL = await getData(secondURL);
        products = products.concat(getDataAtSecondURL.products);
    }
    if (!!sortedProducts){
        products = await sortedProducts(products, productIdToRemove);
    }
    if (!!quantity){
        products = products.splice(0, quantity);
    }
    catalogProductsHTML(products, unitHTML)
}

const catalogProductsHTML = (products, $unitHTML) => {
    products.forEach(productShow => {
        const ratingProduct = Math.round(productShow.rating);
        const discount = Math.floor(productShow.price * ((100 - productShow.discountPercentage)/100));
        const img = randomImage(productShow)

        $unitHTML.insertAdjacentHTML ('beforeend',`  
            <div class="col mb-5">
                <div class="card h-100 btn btn-light js-product-card position-relative" role="button" id = ${productShow.id}>
                    <div class="badge bg-dark text-white position-absolute" style="top: 0.5rem; right: 0.5rem">Sale</div>
                    <img class="card-img-top" src=${img} alt="..." />
                    <div class="card-body p-4">
                        <div class="text-center">
                            <h5 class="fw-bolder">${productShow.title}</h5>
                            ${renderStarRating(ratingProduct)}
                            <span class="text-muted text-decoration-line-through">$${productShow.price}</span> $${discount}
                        </div>
                        <a class="text-decoration-none text-reset link" href="./product.html?id=${productShow.id}"></a>
                    </div>
                    <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
                        <div class="text-center">
                            <a class="btn btn-outline-dark mt-auto position-relative btn-add-to-cart" data-id=${productShow.id} 
                                href="#">Add to cart</a>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        `);
    })
    document.querySelectorAll(".btn-add-to-cart").forEach(el =>
        el.addEventListener('click', clickAddToCart)
    );
}

const productCardHTML = async (url) => {
    const product = await getData(url)
    const $unitHTML = document.querySelector ('.js-product-card-block');
    const discount = Math.floor(product.price * ((100 - product.discountPercentage)/100));
    const img = randomImage(product)

    $unitHTML.insertAdjacentHTML ('beforeend',`
        <div class="row gx-4 gx-lg-5 align-items-center" id = ${product.id}>
            <div class="col-md-6">
                <img class="card-img-top mb-5 mb-md-0" src=${img} alt="..." /></div>
            <div class="col-md-6">
                <div class="small mb-1">SKU: BST-498</div>
                <h1 class="display-5 fw-bolder">${product.title}</h1>
                <div class="fs-5 mb-5">
                    <span class="text-decoration-line-through">$${product.price}</span>
                    <span>$${discount}</span>
                </div>
                    <p class="lead">${product.description}</p>
                    <div class="d-flex">
                        <form id="form" class="row g-3">
                            <input class="form-control text-center me-3 col-auto quantity-product" type="number" 
                            name="quantity" value="1" style="max-width: 4.5rem" />
                            <button class="btn btn-outline-dark flex-shrink-0 btn-add-to-cart col-auto 
                            position-relative link" type="submit" data-id=${product.id}>
                                <i class="bi-cart-fill me-1"></i>
                                Add to cart
                            </button>
                        </form>
                    </div>
                </div>
            </div>
    `);
    document.querySelector("button.btn-add-to-cart").addEventListener('click', clickAddToCart);
    refreshQuantityProduct(product.id);
}

const listProductCartHTML = () => {
    const $unitHTML = document.querySelector('.js-cart-block');
    if(!localStorage.getItem('cart')){
        const $unitHtml = document.querySelector('.cart-is-empty')

        $unitHtml.insertAdjacentHTML('afterbegin', `
        <h2 class="mb-5 fs-1">Your shopping cart is empty :( </h2>`);
    }
    let cart = JSON.parse(localStorage.getItem('cart'));
    let products = cart.products;
    products.forEach((product) => {
        const discount = Math.floor(product.price * ((100 - product.discountPercentage) / 100));

        $unitHTML.insertAdjacentHTML('beforeend', `
        <tr id="product-${product.id}-item">
              <td data-th="product" id =${product.id}>
                <div class="row position-relative">
                  <div class="col-md-3 text-start">
                    <img  src="https://dummyjson.com/image/i/products/${product.id}/1.jpg" alt="" class="img-fluid d-none d-md-block rounded mb-2 shadow">
                  </div>
                  <div class="col-md-9 text-start mt-sm-2">
                    <h4><a class="text-decoration-none text-reset link" 
                    href="http://localhost:63342/shop/product.html?id=${product.id}">
                    ${product.title}</a></h4>
                  </div>
                </div>
              </td>
              <td data-th="price">
                <div class="fs-6 mb-5"><span>$${discount}</span>
                  <span class="text-muted text-decoration-line-through">$${product.price}</span>
              </div>
              </td>
              <form id="form-cart">
                  <td data-th="quantity">
                    <input type="number" class="form-control form-control-lg text-center border border-light" 
                    name="quantity" value="${product.quantity}" id="product-${product.id}-quantity">
                  </td>
                  <td class="actions" data-th="">
                    <div class="text-end">
                      <button class="btn btn-outline-dark btn-md mb-2 btn-update-data position-relative link" 
                      type="submit" data-id-update=${product.id}>
                        <i class="bi bi-arrow-repeat fw-bold"></i>
                      </button>
                      <button class="btn btn-outline-dark btn-md mb-2 btn-delete-data position-relative link"
                      type="submit" data-id-delete=${product.id}>
                        <i class="bi bi-trash3-fill"></i>
                      </button>
                    </div>
                  </td>
              </form>
            </tr>
        `);
    });
    document.querySelectorAll(".btn-update-data").forEach(el =>
        el.addEventListener('click', clickUpdateCart)
    );
    document.querySelectorAll(".btn-delete-data").forEach(el =>
        el.addEventListener('click', clickDeleteProduct)
    );
}

const clickAddToCart = (e) =>{
    e.preventDefault();
    const link = e.target;
    const id = link.dataset.id;
    let quantity = 1
    if(link.previousElementSibling){
        quantity = +link.previousElementSibling.value;
    }
    createUpdateCart(id, quantity);
    setTimeout(refreshQuantityProduct, 500, id);
}

const dataRequest = (id, quantity = 1) =>{
    let product = {
        "id" : id,
        "quantity" : quantity,
    }
    return product
}

const refreshTotalQuantity = () => {
    if(localStorage.getItem('cart')){
        const  $totalQuantity = document.querySelector('.total-quantity')
        let cart = JSON.parse(localStorage.getItem('cart'));
        let totalQuantity = cart.totalQuantity;
        $totalQuantity.innerHTML = totalQuantity;
    }
}

const refreshDiscountedTotal = () => {
    if(localStorage.getItem('cart')){
        const  $discountedTotal = document.querySelector('.discounted-total')
        let cart = JSON.parse(localStorage.getItem('cart'));
        let discountedTotal = cart.discountedTotal;
        $discountedTotal.innerHTML = `$${discountedTotal}`;
    }
}

const clearStorage = () => {
    document.querySelector("a.checkout").addEventListener('click', () =>{
        localStorage.clear();
    });
}

const refreshQuantityProduct = (id) => {
    if(localStorage.getItem('cart')){
        let cart = JSON.parse(localStorage.getItem('cart'));
        let products = cart.products;
        products.forEach((product) => {
            if(product.id == id){
                document.querySelector('.quantity-product').value = product.quantity;

            }
        });
    }
}

const clickUpdateCart = (e) => {
    e.preventDefault();
    const btn = e.target;
    const id = btn.dataset.idUpdate;
    const quantity = document.querySelector(`#product-${id}-quantity`).value;
    updateQuantityInPageCart(id, quantity)
}

const updateQuantityInPageCart = async (id, quantity) => {
    let dataLocalStorage = [];
    let cart = JSON.parse(localStorage.getItem('cart'));
    let products = cart.products;
    products.forEach((product) => {
        if(product.id == id){
            dataLocalStorage.push(dataRequest(product.id, quantity));
        }else{
            dataLocalStorage.push(dataRequest(product.id, product.quantity))
            }
    });
    const res = await fetch('https://dummyjson.com/carts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: 1,
            products: dataLocalStorage
        })
    })
    const data = await res.json();
    localStorage.setItem('cart', JSON.stringify(data));
    refreshTotalQuantity();
    refreshDiscountedTotal();
}

const clickDeleteProduct = (e) => {
    e.preventDefault();
    const btn = e.target;
    const id = btn.dataset.idDelete;
    deleteProduct(id)
}

const deleteProduct = async (id) => {
    let dataLocalStorage = [];
    let cart = JSON.parse(localStorage.getItem('cart'));
    let products = cart.products;
    products.forEach((product) => {
        if(product.id != id){
            dataLocalStorage.push(dataRequest(product.id, product.quantity))
        }
    });
    if(dataLocalStorage.length === 0){
        localStorage.clear();
        const  $discountedTotal = document.querySelector('.discounted-total')
        $discountedTotal.innerHTML = `$00.00`;
        const  $totalQuantity = document.querySelector('.total-quantity')
        $totalQuantity.innerHTML = '0';
    }else{
        const res = await fetch('https://dummyjson.com/carts/add', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                userId: 1,
                products: dataLocalStorage
            })
        })
        const data = await res.json();
        localStorage.setItem('cart', JSON.stringify(data));
    }
    document.querySelector(`#product-${id}-item`).remove();
    refreshTotalQuantity();
    refreshDiscountedTotal();

}

const createUpdateCart = async (id, quantity = 1) => {
    try{
        let cartLocalStorage = localStorage.getItem('cart');
        let dataLocalStorage = [];
        let isNew = true;
        if(!!cartLocalStorage){
            let cart = JSON.parse(localStorage.getItem('cart'));
            let products = cart.products;
            products.forEach((product) => {
                if(product.id == id){
                    isNew = false;
                    quantity += product.quantity;
                    dataLocalStorage.push(dataRequest(product.id, quantity));
                }else{
                    dataLocalStorage.push(dataRequest(product.id, product.quantity))
                }
            });
        }

        if (isNew){
            dataLocalStorage.push(dataRequest(id, quantity))
        }
        const res = await fetch('https://dummyjson.com/carts/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 1,
                products: dataLocalStorage
            })
        })
        const data = await res.json();
        localStorage.setItem('cart', JSON.stringify(data));
        refreshTotalQuantity()
    }catch (err){
        console.log(err)
    }
}

const main = () => {
    const location = window.location.pathname.split('/').at(-1);
    if (location === "all-products.html"){
        maskLoader();
        catalogProductsRender(urlPhone, urlLaptop, sortedRating);
    }
    if (location === "smartphones.html"){
        maskLoader();
        catalogProductsRender(urlPhone, undefined, sortedRating);
    }
    if (location === "product.html"){
        const query = new URLSearchParams(window.location.search);
        const productId = query.get('id');
        if(productId){
            productCardHTML(`https://dummyjson.com/products/${productId}`);
            dataRelatedProducts(`https://dummyjson.com/products/${productId}`);
        }else{
            window.open(`${window.location.pathname.split('/').slice(0, -1).join('/')}/index.html`, '_self');
        }
    }
    if (location === "laptops.html"){
        maskLoader();
        catalogProductsRender(urlLaptop,undefined, sortedRating)
    }
    if (location === "cart.html"){
        listProductCartHTML();
        refreshDiscountedTotal();
        clearStorage();
    }
    if (location === "index.html"){
        maskLoader();
        catalogProductsRender(urlPhone, urlLaptop, sortedRating, 9);
    }
    refreshTotalQuantity();
}
main();



