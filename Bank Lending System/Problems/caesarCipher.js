function caesarCipher(message, shift, decode = false) {
  if (decode) shift = 26 - shift;
  return message
    .split('')
    .map((c) => {
      if (/[A-Z]/.test(c))
        return String.fromCharCode((c.charCodeAt(0) - 65 + shift) % 26 + 65);
      else if (/[a-z]/.test(c))
        return String.fromCharCode((c.charCodeAt(0) - 97 + shift) % 26 + 97);
      else return c;
    }).join('');
}
module.exports = caesarCipher;