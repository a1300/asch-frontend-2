import AschJs from 'asch-js'
import Bip39 from 'bip39'
import { BigNumber } from 'bignumber.js'

export const getPub = secret => AschJs.crypto.getKeys(secret).publicKey

export const getAddr = publicKey => AschJs.crypto.getAddress(publicKey)

export const createVote = (voteContent, secret, secondpassword) =>
  AschJs.vote.createVote(voteContent, secret, secondpassword)

export const createDelegate = (userName, secret, secondpassword = '') =>
  AschJs.delegate.createDelegate(userName, secret, secondpassword)

export const createInnerTransaction = (options, secret) =>
  AschJs.dapp.createInnerTransaction(options, secret)

export const createTrans = (currency, amount, fromto, message, secret, secondPassword = '') => {
  if (currency === 'XAS') {
    return AschJs.transaction.createTransaction(fromto, Number(amount), message, secret, secondPassword)
  } else {
    return AschJs.uia.createTransfer(currency, amount, fromto, message, secret, secondPassword)
  }
}

export const createTransaction = (fromto, amount, message, secret, secondPassword = '') =>
  AschJs.transaction.createTransaction(fromto, amount, message, secret, secondPassword)

export const createTransfer = (currency, amount, fromto, message, secret, secondPassword = '') =>
  AschJs.uia.createTransfer(currency, amount, fromto, message, secret, secondPassword)

export const createInTransfer = (transactionId, currency, amount, secret, secondPassword = '') =>
  AschJs.transfer.createInTransfer(transactionId, currency, amount, secret, secondPassword)

export const createLock = (lockHeight, secret, secondpassword) =>
  AschJs.transaction.createLock(lockHeight, secret, secondpassword)

export const signature = (secret, secondpassword = '') =>
  AschJs.signature.createSignature(secret, secondpassword)

export const createFlags = (currency, flagType, flag, secret, secondPassword = '') =>
  AschJs.uia.createFlags(currency, flagType, flag, secret, secondPassword)

export const createIssuer = (name, desc, secret, secondPassword = '') =>
  AschJs.uia.createIssuer(name, desc, secret, secondPassword)

export const createIssue = (name, realAmount, secret, secondPassword = '') =>
  AschJs.uia.createIssue(name, String(realAmount), secret, secondPassword)

export const createAcl = (currency, operator, flag, list, secret, secondPassword = '') =>
  AschJs.uia.createAcl(currency, operator, flag, list, secret, secondPassword)

export const createAsset = (
  name,
  desc,
  realMaximum,
  precision,
  strategy,
  allowWriteoff,
  allowWhitelist,
  allowBlacklist,
  secret,
  secondPassword = ''
) =>
  AschJs.uia.createAsset(
    String(name),
    String(desc),
    String(realMaximum),
    precision,
    strategy,
    allowWriteoff,
    allowWhitelist,
    allowBlacklist,
    secret,
    secondPassword
  )

export const generateM = () => Bip39.generateMnemonic()
export const fullTimestamp = timestamp => AschJs.utils.format.fullTimestamp(timestamp)
// export const beginTimestamp = () => AschJs.utils.slots.beginEpochTime()
export const convertFee = (fee, precision = 8) => {
  if (!fee) {
    return 0
  }
  fee = fee.toString()
  var clearView = false
  while (fee.length < (precision + 1)) {
    fee = '0'.concat(fee)
  }
  if (precision !== 0) {
    fee = fee.slice(0, -precision).concat('.', fee.slice(-precision))
    while (!clearView) {
      if (fee[fee.length - 1] === '0') {
        fee = fee.slice(0, fee.length - 1)
      } else {
        clearView = true
      }
    }
  }

  if (fee[fee.length - 1] === '.') {
    fee = fee.slice(0, fee.length - 1)
  }
  return fee
}
export const dealBigNumber = num => {
  let dealNumB = new BigNumber(num)
  let dealNum = dealNumB.toFormat(0).toString()
  return dealNum.replace(/,/g, '')
}
export const dealGiantNumber = (num, precision) => {
  let bunch = ''
  let tail = (function () {
    for (let i = 0; i < precision; i++) {
      bunch = bunch + '0'
    }
    return bunch
  })()
  return num + tail
}

export const check58 = address => AschJs.crypto.isBase58CheckAddress(address)
