// Proxy para SuperFrete API (contorna CORS)
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const SUPERFRETE_API_URL = 'https://api.superfrete.com';
const SUPERFRETE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTk0MTEwNjcsInN1YiI6IjRrZFhaNVRENlVUTGNkUzhORzM5OGp5QldtOTMifQ.bK_vfNIip8Kd2Gz6FISxyK-n4e-suFWEuW08hI0ezuU';

class SuperFreteClient {
  constructor(token = SUPERFRETE_TOKEN) {
    this.token = token;
    this.baseUrl = SUPERFRETE_API_URL;
  }

  async makeRequest(endpoint, options = {}) {
    // Usar proxy para contornar CORS
    const proxyUrl = `${PROXY_URL}${this.baseUrl}${endpoint}`;
    
    const response = await fetch(proxyUrl, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Imperium7/1.0 (gabrielperfumes990@gmail.com)',
        'X-Requested-With': 'XMLHttpRequest',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`SuperFrete API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Cotação de frete
  async cotacaoDeFrete(request) {
    return this.makeRequest('/quote', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Adicionar frete ao carrinho
  async adicionarFreteCarrinho(payload) {
    return this.makeRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Finalizar pedido e gerar etiqueta
  async finalizarPedidoEGerarEtiqueta(payload) {
    return this.makeRequest('/checkout', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Link para impressão de etiqueta
  async tagLink(request) {
    return this.makeRequest('/tag/print', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Informações do pedido
  async informacoesDoPedido(request) {
    return this.makeRequest(`/order/info?id=${request.id}`, {
      method: 'GET',
    });
  }

  // Cancelar pedido
  async cancelarPedido(request) {
    return this.makeRequest('/order/cancel', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

// Export singleton instance
export const superfreteClient = new SuperFreteClient();

// Helper function to calculate shipping with fixed dimensions
export async function calculateShippingWithSuperFrete(
  fromZip,
  toZip,
  quantity = 1,
  services = '1,2,17'
) {
  try {
    // Dimensões fixas: 12x12x19 cm
    const packageInfo = {
      height: 12, // cm
      width: 12,  // cm
      length: 19, // cm
      weight: 0.5 * quantity, // kg por unidade
    };

    const request = {
      from: { postal_code: fromZip },
      to: { postal_code: toZip },
      services,
      options: {
        own_hand: false,
        receipt: false,
        insurance_value: 0,
        use_insurance_value: false,
      },
      package: packageInfo,
    };

    const response = await superfreteClient.cotacaoDeFrete(request);
    return response.data || [];
  } catch (error) {
    console.error('Error calculating shipping with SuperFrete:', error);
    throw error;
  }
}