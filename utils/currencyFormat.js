// src/utils/formatters.js
/**
 * Formata um valor numérico para exibir como preço
 * @param {number|string|null|undefined} value - Valor a ser formatado
 * @param {number} decimals - Número de casas decimais (padrão: 2)
 * @param {string} currency - Símbolo da moeda (padrão: R$)
 * @param {string} decimalSeparator - Separador decimal (padrão: ,)
 * @param {string} thousandsSeparator - Separador de milhares (padrão: .)
 * @returns {string} Valor formatado como preço
 */
export function formatPrice(
  value, 
  decimals = 2, 
  currency = 'R$', 
  decimalSeparator = ',', 
  thousandsSeparator = '.'
) {
  // Se o valor for undefined, null ou não for número, retorna zero formatado
  if (value === undefined || value === null || isNaN(Number(value))) {
    return `${currency} 0${decimalSeparator}${'0'.repeat(decimals)}`;
  }

  // Converte para número e fixa casas decimais
  const numValue = Number(value);
  const fixedValue = Math.abs(numValue).toFixed(decimals);
  
  // Separa parte inteira e decimal
  const [intPart, decPart] = fixedValue.split('.');
  
  // Formata parte inteira com separador de milhares
  const formattedIntPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  
  // Monta o valor final
  const formattedValue = `${numValue < 0 ? '-' : ''}${currency} ${formattedIntPart}${decimalSeparator}${decPart}`;
  
  return formattedValue;
}