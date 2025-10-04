// Cálculo de frete local (sem dependência de APIs externas)
export function calculateLocalShipping(cep, quantity = 1) {
  // CEP de origem: São Paulo (01153000)
  const originCep = '07080-000';
  
  // Extrair apenas números do CEP
  const cleanCep = cep.replace(/\D/g, '');
  
  if (cleanCep.length !== 8) {
    return [];
  }

  // Simular diferentes opções de frete baseadas na região
  const cepNumber = parseInt(cleanCep);
  const region = getRegionByCep(cepNumber);
  
  // Dimensões fixas: 12x12x19 cm, peso: 0.5kg por unidade
  const totalWeight = 0.3 * quantity;
  
  const quotes = [
    {
      id: 1,
      name: 'PAC',
      price: calculatePACPrice(region, totalWeight),
      delivery_time: getPACDeliveryTime(region),
      company: { name: 'Correios' },
      has_error: false
    },
    {
      id: 2,
      name: 'SEDEX',
      price: calculateSEDEXPrice(region, totalWeight),
      delivery_time: getSEDEXDeliveryTime(region),
      company: { name: 'Correios' },
      has_error: false
    },
    {
      id: 3,
      name: 'Transportadora',
      price: calculateTransportadoraPrice(region, totalWeight),
      delivery_time: getTransportadoraDeliveryTime(region),
      company: { name: 'Transportadora Local' },
      has_error: false
    }
  ];

  return quotes;
}

function getRegionByCep(cep) {
  // Regiões baseadas no CEP
  if (cep >= 1000000 && cep <= 1999999) return 'SP'; // São Paulo
  if (cep >= 2000000 && cep <= 2999999) return 'RJ'; // Rio de Janeiro
  if (cep >= 3000000 && cep <= 3999999) return 'MG'; // Minas Gerais
  if (cep >= 4000000 && cep <= 4999999) return 'BA'; // Bahia
  if (cep >= 5000000 && cep <= 5999999) return 'PE'; // Pernambuco
  if (cep >= 6000000 && cep <= 6999999) return 'CE'; // Ceará
  if (cep >= 7000000 && cep <= 7999999) return 'DF'; // Distrito Federal
  if (cep >= 8000000 && cep <= 8999999) return 'PR'; // Paraná
  if (cep >= 9000000 && cep <= 9999999) return 'RS'; // Rio Grande do Sul
  return 'OTHER'; // Outras regiões
}

function calculatePACPrice(region, weight) {
  const basePrice = 12;
  const weightPrice = weight * 3;
  
  const regionMultiplier = {
    'SP': 1.0,
    'RJ': 1.2,
    'MG': 1.1,
    'BA': 1.3,
    'PE': 1.4,
    'CE': 1.4,
    'DF': 1.2,
    'PR': 1.1,
    'RS': 1.3,
    'OTHER': 1.5
  };
  
  return Math.round((basePrice + weightPrice) * regionMultiplier[region] * 100) / 100;
}

function calculateSEDEXPrice(region, weight) {
  const basePrice = 18;
  const weightPrice = weight * 4;
  
  const regionMultiplier = {
    'SP': 1.0,
    'RJ': 1.3,
    'MG': 1.2,
    'BA': 1.4,
    'PE': 1.5,
    'CE': 1.5,
    'DF': 1.3,
    'PR': 1.2,
    'RS': 1.4,
    'OTHER': 1.6
  };
  
  return Math.round((basePrice + weightPrice) * regionMultiplier[region] * 100) / 100;
}

function calculateTransportadoraPrice(region, weight) {
  const basePrice = 15;
  const weightPrice = weight * 2.5;
  
  const regionMultiplier = {
    'SP': 1.0,
    'RJ': 1.1,
    'MG': 1.05,
    'BA': 1.2,
    'PE': 1.3,
    'CE': 1.3,
    'DF': 1.1,
    'PR': 1.05,
    'RS': 1.2,
    'OTHER': 1.4
  };
  
  return Math.round((basePrice + weightPrice) * regionMultiplier[region] * 100) / 100;
}

function getPACDeliveryTime(region) {
  const deliveryTimes = {
    'SP': 3,
    'RJ': 4,
    'MG': 4,
    'BA': 5,
    'PE': 6,
    'CE': 6,
    'DF': 4,
    'PR': 4,
    'RS': 5,
    'OTHER': 7
  };
  
  return deliveryTimes[region];
}

function getSEDEXDeliveryTime(region) {
  const deliveryTimes = {
    'SP': 1,
    'RJ': 2,
    'MG': 2,
    'BA': 3,
    'PE': 3,
    'CE': 3,
    'DF': 2,
    'PR': 2,
    'RS': 3,
    'OTHER': 4
  };
  
  return deliveryTimes[region];
}

function getTransportadoraDeliveryTime(region) {
  const deliveryTimes = {
    'SP': 2,
    'RJ': 3,
    'MG': 3,
    'BA': 4,
    'PE': 4,
    'CE': 4,
    'DF': 3,
    'PR': 3,
    'RS': 4,
    'OTHER': 5
  };
  
  return deliveryTimes[region];
}
