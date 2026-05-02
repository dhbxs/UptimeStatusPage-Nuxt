export function useTheme() {
  const colorMode = useColorMode()

  const isDark = ref(colorMode.value === 'dark')

  const toggleTheme = () => {
    isDark.value = !isDark.value
    colorMode.preference = isDark.value ? 'dark' : 'light'
  }

  return reactive({
    isDark,
    toggleTheme
  })
}
