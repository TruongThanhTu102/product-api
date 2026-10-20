
const test = require('node:test');
const assert = require('node:assert/strict');

const API_URL = process.env.API_URL || 'http://localhost:3000';

test('Product API supports complete CRUD operations', async (t) => {
    const product = {
        pid: `CI-${Date.now()}`,
        pname: 'San pham kiem thu CI',
        price: 25000,
        quantity: 10
    };

    // 1. CREATE: Thêm sản phẩm
    const createResponse = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    });

    assert.equal(createResponse.status, 201);

    const created = await createResponse.json();
    assert.equal(created.pid, product.pid);
    assert.equal(created.pname, product.pname);

    // Đảm bảo xóa sản phẩm kể cả khi test thất bại
    t.after(async () => {
        await fetch(`${API_URL}/api/products/${product.pid}`, {
            method: 'DELETE'
        });
    });

    // 2. READ: Đọc sản phẩm theo mã
    const readResponse = await fetch(
        `${API_URL}/api/products/${product.pid}`
    );

    assert.equal(readResponse.status, 200);

    const readProduct = await readResponse.json();
    assert.equal(readProduct.price, product.price);
    assert.equal(readProduct.quantity, product.quantity);

    // 3. UPDATE: Cập nhật sản phẩm
    const updateResponse = await fetch(
        `${API_URL}/api/products/${product.pid}`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pname: 'San pham da cap nhat',
                price: 30000,
                quantity: 20
            })
        }
    );

    assert.equal(updateResponse.status, 200);

    const updated = await updateResponse.json();
    assert.equal(updated.pname, 'San pham da cap nhat');
    assert.equal(updated.price, 30000);
    assert.equal(updated.quantity, 20);

    // 4. DELETE: Xóa sản phẩm
    const deleteResponse = await fetch(
        `${API_URL}/api/products/${product.pid}`,
        { method: 'DELETE' }
    );

    assert.equal(deleteResponse.status, 200);

    // Kiểm tra sản phẩm đã bị xóa
    const missingResponse = await fetch(
        `${API_URL}/api/products/${product.pid}`
    );

    assert.equal(missingResponse.status, 404);
});
