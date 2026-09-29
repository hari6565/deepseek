const decodeToken = (token: string) => {
  const base64Url = token.split('.')[1]
  if (base64Url) {
    const base64 = base64Url.replace('-', '+').replace('_', '/')
    return JSON.parse(window.atob(base64))
  }
  return { users: '' }
}
export default decodeToken
