export function normalizePem(pem: string): string {
  if (!pem) return pem
  const flattened = pem.replace(/\\r\\n|\\n|\\r/g, '\n').trim()
  const match = flattened.match(/-----BEGIN ([A-Z0-9 ]+)-----([\s\S]*?)-----END \1-----/)
  if (!match) return flattened
  const [, label, rawBody] = match
  const body = rawBody.replace(/\s+/g, '')
  const lines = body.match(/.{1,64}/g) || []
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----\n`
}
