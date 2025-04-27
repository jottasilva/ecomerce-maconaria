import axios from 'axios';

class OrderStatus {
  static async update(id) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL+'/orders/'+id+'/';
      const response = await axios.patch(apiUrl, {
        "status": "processing"
      });
      return response.data;
    } catch(err) {
      console.error("Error updating order status:", err);
    }
  }
}

export default OrderStatus;