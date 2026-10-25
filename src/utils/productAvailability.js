export function hasProductPrice(product) {
    return Number.isFinite(product?.price) && product.price > 0
}
