import { Image, Text } from 'react-native'
import { emojiSource } from '../emojiAssets'

// Draws an emoji as a bundled image, falling back to the glyph for anything
// not in the asset set. `size` is the em-equivalent box.
export default function Pic({ emoji, size = 32, style }) {
  const source = emojiSource(emoji)
  if (!source) {
    return (
      <Text style={[{ fontSize: size }, style]} allowFontScaling={false}>
        {emoji}
      </Text>
    )
  }
  return <Image source={source} style={[{ width: size, height: size }, style]} resizeMode="contain" />
}
