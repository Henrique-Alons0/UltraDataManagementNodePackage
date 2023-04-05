import AddressParser from 'libaddressinput';

function formatDate (date, format) {
  const moment = require('moment')

  const inputFormat = 'DD/MM/YYYY' // formato padrão de entrada
  const parsedDate = moment(date, inputFormat, true)
  if (!parsedDate.isValid()) {
    throw new Error('Data inválida')
  }
  return parsedDate.format(format)
}

function formatNumber(number, withPunctuation, formatType) {
  const numberString = number.toString();
  const parts = numberString.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1] || '';

  switch (formatType) {
    case 'brl':
      if (withPunctuation) {
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      }
      return `R$ ${integerPart},${decimalPart}`;
    case 'usd':
      if (withPunctuation) {
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
      return `$${integerPart}.${decimalPart}`;
    case 'eur':
      if (withPunctuation) {
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      }
      return `${integerPart},${decimalPart} €`;
    case 'binary':
      return `${integerPart} ${decimalPart}b`;
    default:
      if (withPunctuation) {
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      }
      return `${integerPart}.${decimalPart}`;
  }
}


function formatCurrency(value, currency = 'BRL', pattern = '#,##0.00') {
  const currencyFormatter = require('currency-formatter')

  const formattedCurrency = currencyFormatter.format(value, { code: currency, pattern: pattern })
  return formattedCurrency
}

async function convertCurrency (amount, fromCurrency, toCurrency) {
  const OpenExchangeRates = require('openexchangerates-api')
  const fx = require('money')

  const openExchangeRates = new OpenExchangeRates({
    appId: 'SUA_CHAVE_DE_API_AQUI'
  })
  await openExchangeRates.latest()
  fx.base = openExchangeRates.base
  fx.rates = openExchangeRates.rates

  const convertedAmount = fx.convert(amount, { from: fromCurrency, to: toCurrency })
  return convertedAmount
}

function textFormat () {
  
}

function formatPhoneNumber(phoneNumber, removeSpecialChars = false) {

  const PhoneNumber = require('libphonenumber-js')

  const parsedPhoneNumber = PhoneNumber.parse(phoneNumber, 'BR')
  if (!PhoneNumber.isValidNumber(parsedPhoneNumber)) {
    throw new Error('Número de telefone inválido')
  }
  
  const formattedPhoneNumber = PhoneNumber.format(parsedPhoneNumber, 'INTERNATIONAL')
  return removeSpecialChars ? formattedPhoneNumber.replace(/[^\d]/g, '') : formattedPhoneNumber
}

function formatDocumentNumber(documentNumber, withPunctuation, documentType) {
  const cleanNumber = documentNumber.replace(/[^\d]/g, '');
  let formattedNumber;

  if (documentType === 'cpf') {
    formattedNumber = cleanNumber.replace(
      /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
      '$1.$2.$3-$4'
    );
    isValidCPF(formattedNumber) == true ? formattedNumber : "CPF Inválido!"
  } else if (documentType === 'cnpj') {
    formattedNumber = cleanNumber.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
    validateCNPJ(formattedNumber) == true ? formattedNumber : "CNPJ Inválido!"
  } else {
    throw new Error(`Invalid document type: ${documentType}`);
  }

  if (!withPunctuation) {
    formattedNumber = formattedNumber.replace(/[^\d]/g, '');
  }

  return formattedNumber
}

function isValidCPF(cpf) {
  // Remove caracteres especiais e deixa apenas números
  cpf = cpf.replace(/[^\d]/g, '');

  // Verifica se o CPF possui 11 dígitos
  if (cpf.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais
  const allEqual = cpf.split('').every((digit, i, arr) => digit === arr[0]);
  if (allEqual) {
    return false;
  }

  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let firstVerifierDigit = 11 - (sum % 11);
  if (firstVerifierDigit > 9) {
    firstVerifierDigit = 0;
  }

  // Calcula o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  let secondVerifierDigit = 11 - (sum % 11);
  if (secondVerifierDigit > 9) {
    secondVerifierDigit = 0;
  }

  // Retorna true se os dígitos verificadores estão corretos
  return cpf.endsWith(`${firstVerifierDigit}${secondVerifierDigit}`);
}

function validateCNPJ(cnpj) {
  // Remove caracteres inválidos
  cnpj = cnpj.replace(/[^\d]/g, '');

  // Verifica se o CNPJ tem 14 dígitos
  if (cnpj.length !== 14) {
    return false;
  }

  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * (6 - (i % 8));
  }
  let mod = sum % 11;
  let digit = mod < 2 ? 0 : 11 - mod;

  // Verifica se o primeiro dígito verificador está correto
  if (parseInt(cnpj[12]) !== digit) {
    return false;
  }

  // Calcula o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * (7 - (i % 8));
  }
  mod = sum % 11;
  digit = mod < 2 ? 0 : 11 - mod;

  // Verifica se o segundo dígito verificador está correto
  if (parseInt(cnpj[13]) !== digit) {
    return false;
  }

  return true;
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function isValidAddress(address) {

  const parser = new AddressParser();
  const parsedAddress = parser.parseAddress(address, 'BR'); // informe o código ISO do país
  return parsedAddress !== null;
}
