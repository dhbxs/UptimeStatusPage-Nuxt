export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const response = await $fetch('https://api.uptimerobot.com/v2/getMonitors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      api_key: config.public.apiKey,
      ...body
    }
  })

  return response
})