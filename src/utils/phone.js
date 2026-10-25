export function normalizeSpanishPhone(phone) {
    if (typeof phone !== 'string') return null

    const compact = phone.replace(/[\p{Zs}-]/gu, '')
    const national = compact.startsWith('+34') ? compact.slice(3) : compact

    if (national.length !== 9 || !/^[6789][0-9]{8}$/.test(national)) {
        return null
    }

    return `+34${national}`
}
