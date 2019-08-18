const CoinbasePro = require('coinbase-pro');

// public client api always should use real coinbase api endpoint
const PUBLIC_CLIENT_API = 'https://api.pro.coinbase.com';

module.exports = {
  getCurrentPriceOfProduct: async ({ productId }) => {
    const publicClient = new CoinbasePro.PublicClient(PUBLIC_CLIENT_API);
    const { price } = await publicClient.getProductTicker(productId);
    return { currentPriceOfProduct: parseFloat(price) };
  },

  buyProduct: async ({ productId, purchaseAmount, gdaxKey, gdaxSecret, gdaxPassphrase }) => {
    const authedClient = new CoinbasePro.AuthenticatedClient(
      gdaxKey,
      gdaxSecret,
      gdaxPassphrase,
      process.env.GDAX_API_URI
    );

    const params = {
      side: 'buy',
      type: 'market',
      product_id: productId,
      funds: purchaseAmount
    };

    const order = await authedClient.placeOrder(params);

    let updatedOrder;
    let orderStatus = '';
    while (orderStatus !== 'done') {
      updatedOrder = await authedClient.getOrder(order.id);
      orderStatus = updatedOrder.status;
    }

    return { cryptoPurchased: updatedOrder.filled_size, orderId: `${order.id}` };
  }
};
