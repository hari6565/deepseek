export function checkDataAccess(token: string | undefined) {
  if (!token) return false
  const decodedTokenString = Buffer.from(
    token.split('.')[1],
    'base64'
  ).toString('utf8')
  const decodedToken = decodedTokenString ? JSON.parse(decodedTokenString) : {}
  
  if (decodedToken?.isAppAdmin) {
    return true
  }
  return false
}
