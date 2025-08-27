document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('invoiceDisplay').style.display = 'none';
});

function searchInvoice() {
    const invoiceNumber = document.getElementById('invoiceNumber').value.trim();
    const invoiceDisplay = document.getElementById('invoiceDisplay');

    if (invoiceNumber === '') {
        showNotification('Please enter an invoice/order number', 'warning');
        return;
    }

    // Show loading state
    invoiceDisplay.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-color);"></i>
            <p style="margin-top: 15px;">Searching for invoice...</p>
        </div>
    `;
    invoiceDisplay.style.display = 'block';

    fetch(`/api/invoice/${invoiceNumber}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Invoice not found');
            }
            return response.json();
        })
        .then(data => {
            if (!data || !data.order || data.items.length === 0) {
                invoiceDisplay.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #e74c3c;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                        <h3>No Invoice Found</h3>
                        <p>No invoice found for ID: ${invoiceNumber}</p>
                    </div>
                `;
                return;
            }

            const { order, items } = data;
            const date = new Date(order.order_date).toLocaleDateString();
            const customerInfo = order.customer_id ? `Customer ID: ${order.customer_id}` : 'Walk-in Customer';

            let invoiceHTML = `
                <div class="invoice-header">
                    <h3>Invoice #${invoiceNumber}</h3>
                    <span class="date"><i class="far fa-calendar-alt"></i> ${date}</span>
                </div>
                <div class="customer-info">
                    <p><i class="far fa-user"></i> <strong>Customer:</strong> ${customerInfo}</p>
                    <p><i class="fas fa-credit-card"></i> <strong>Payment Method:</strong> ${order.payment_method || 'Cash'}</p>
                    ${order.card_holder ? `<p><i class="fas fa-user"></i> <strong>Card Holder:</strong> ${order.card_holder}</p>` : ''}
                    ${order.card_last_four ? `<p><i class="fas fa-credit-card"></i> <strong>Card:</strong> ****${order.card_last_four}</p>` : ''}
                </div>
                <table class="invoice-items">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>`;

            let total = 0;
            items.forEach(item => {
                const itemTotal = parseFloat(item.total_price) || 0;
                total += itemTotal;

                invoiceHTML += `
                    <tr>
                        <td>${item.product_name}</td>
                        <td>${item.quantity}</td>
                        <td>Rs. ${parseFloat(item.unit_price).toFixed(2)}</td>
                        <td>Rs. ${itemTotal.toFixed(2)}</td>
                        <td>
                            <button class="return-btn" onclick="processReturn('${item.product_name}', ${item.quantity}, ${item.unit_price}, ${invoiceNumber})">
                                <i class="fas fa-undo"></i> Return
                            </button>
                        </td>
                    </tr>`;
            });

            invoiceHTML += `</tbody>
                <tfoot>
                    <tr>
                        <td colspan="3"><strong>Subtotal</strong></td>
                        <td><strong>Rs. ${total.toFixed(2)}</strong></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td colspan="3"><strong>Paid Amount</strong></td>
                        <td><strong>Rs. ${(parseFloat(order.paid_amount) || 0).toFixed(2)}</strong></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td colspan="3"><strong>Change Returned</strong></td>
                        <td><strong>Rs. ${(parseFloat(order.change_amount) || 0).toFixed(2)}</strong></td>
                        <td></td>
                    </tr>
                </tfoot>
                </table>
                
                <div class="invoice-actions" style="margin-top: 20px; text-align: center;">
                    <button class="btn btn-primary" onclick="printInvoice()">
                        <i class="fas fa-print"></i> Print Invoice
                    </button>
                    <button class="btn btn-secondary" onclick="downloadInvoice()">
                        <i class="fas fa-download"></i> Download PDF
                    </button>
                </div>
            `;

            invoiceDisplay.innerHTML = invoiceHTML;
        })
        .catch(err => {
            invoiceDisplay.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                    <h3>Error</h3>
                    <p>${err.message}</p>
                </div>
            `;
        });
}

function processReturn(productName, quantity, unitPrice, invoiceNumber) {
    const returnModal = document.createElement('div');
    returnModal.className = 'modal show';
    returnModal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="return-header" style="background: #e74c3c; color: white; padding: 20px; margin: -30px -30px 20px -30px; border-radius: 10px 10px 0 0;">
                <h3><i class="fas fa-undo"></i> Process Return</h3>
            </div>
            
            <div class="return-details">
                <p><strong>Product:</strong> ${productName}</p>
                <p><strong>Original Quantity:</strong> ${quantity}</p>
                <p><strong>Unit Price:</strong> Rs. ${unitPrice}</p>
                <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
            </div>
            
            <form id="returnForm">
                <div class="form-group" style="margin: 20px 0;">
                    <label for="returnQuantity">Return Quantity:</label>
                    <input type="number" id="returnQuantity" min="1" max="${quantity}" value="1" 
                           style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                </div>
                
                <div class="form-group" style="margin: 20px 0;">
                    <label for="returnReason">Return Reason:</label>
                    <select id="returnReason" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                        <option value="defective">Defective Product</option>
                        <option value="expired">Expired Product</option>
                        <option value="wrong_item">Wrong Item</option>
                        <option value="customer_request">Customer Request</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <div class="form-group" style="margin: 20px 0;">
                    <label for="returnNotes">Additional Notes:</label>
                    <textarea id="returnNotes" rows="3" placeholder="Enter any additional notes..." 
                              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; resize: vertical;"></textarea>
                </div>
                
                <div class="return-summary" style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Return Amount: Rs. <span id="returnAmount">${unitPrice}</span></strong></p>
                </div>
                
                <div class="modal-buttons" style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn btn-danger">
                        <i class="fas fa-undo"></i> Process Return
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(returnModal);
    
    // Update return amount when quantity changes
    document.getElementById('returnQuantity').addEventListener('input', function() {
        const returnQty = parseInt(this.value) || 0;
        const returnAmount = returnQty * unitPrice;
        document.getElementById('returnAmount').textContent = returnAmount.toFixed(2);
    });
    
    // Handle return form submission
    document.getElementById('returnForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const returnData = {
            invoice_number: invoiceNumber,
            product_name: productName,
            original_quantity: quantity,
            return_quantity: parseInt(document.getElementById('returnQuantity').value),
            unit_price: unitPrice,
            return_reason: document.getElementById('returnReason').value,
            return_notes: document.getElementById('returnNotes').value,
            return_amount: parseInt(document.getElementById('returnQuantity').value) * unitPrice
        };
        
        // Process the return
        fetch('/api/process_return', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(returnData)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                showNotification('Return processed successfully!', 'success');
                returnModal.remove();
                // Refresh the invoice display
                searchInvoice();
            } else {
                showNotification(result.message || 'Error processing return', 'error');
            }
        })
        .catch(error => {
            console.error('Error processing return:', error);
            showNotification('Error processing return', 'error');
        });
    });
}

function printInvoice() {
    window.print();
}

function downloadInvoice() {
    showNotification('PDF download feature will be implemented soon', 'info');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : type === 'warning' ? '#f39c12' : '#3498db'};
        color: white;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            ${message}
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// Add CSS for animations and return button
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .return-btn {
        background: #e74c3c;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.85rem;
        transition: all 0.3s ease;
    }
    
    .return-btn:hover {
        background: #c0392b;
        transform: translateY(-1px);
    }
    
    .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    
    .btn-primary {
        background: #0098b0;
        color: white;
    }
    
    .btn-secondary {
        background: #6c757d;
        color: white;
    }
    
    .btn-danger {
        background: #e74c3c;
        color: white;
    }
    
    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .modal-content {
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        max-width: 90%;
        max-height: 90%;
        overflow-y: auto;
    }
`;
document.head.appendChild(style);