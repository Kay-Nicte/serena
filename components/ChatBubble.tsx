import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { ImageViewer } from './ImageViewer';

interface ChatBubbleProps {
  content: string;
  imageUrl?: string | null;
  isMine: boolean;
  timestamp: string;
  readAt?: string | null;
  showReadReceipt?: boolean;
}

function formatTime(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatBubble({ content, imageUrl, isMine, timestamp, readAt, showReadReceipt = false }: ChatBubbleProps) {
  const [viewerVisible, setViewerVisible] = useState(false);

  return (
    <View style={[styles.container, isMine ? styles.mine : styles.theirs]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs, imageUrl ? styles.bubbleImage : undefined]}>
        {imageUrl ? (
          <>
            <TouchableOpacity onPress={() => setViewerVisible(true)} activeOpacity={0.9}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                contentFit="cover"
                transition={200}
              />
            </TouchableOpacity>
            <ImageViewer
              uri={imageUrl}
              visible={viewerVisible}
              onClose={() => setViewerVisible(false)}
            />
          </>
        ) : null}
        {content ? (
          <Text style={[styles.text, isMine ? styles.textMine : styles.textTheirs]}>
            {content}
          </Text>
        ) : null}
        <View style={styles.meta}>
          <Text style={[styles.time, isMine ? styles.timeMine : styles.timeTheirs]}>
            {formatTime(timestamp)}
          </Text>
          {isMine && showReadReceipt && (
            <Ionicons
              name={readAt ? 'checkmark-done' : 'checkmark'}
              size={14}
              color={readAt ? '#A8E6CF' : 'rgba(255,255,255,0.5)'}
              style={styles.readIcon}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 2,
  },
  mine: {
    alignItems: 'flex-end',
  },
  theirs: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: Colors.surfaceSecondary,
    borderBottomLeftRadius: 4,
  },
  bubbleImage: {
    paddingHorizontal: 4,
    paddingTop: 4,
    overflow: 'hidden',
  },
  image: {
    width: 200,
    height: 260,
    borderRadius: 14,
  },
  text: {
    fontSize: 15,
    fontFamily: Fonts.body,
    lineHeight: 21,
  },
  textMine: {
    color: Colors.textOnPrimary,
  },
  textTheirs: {
    color: Colors.text,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 4,
    gap: 3,
  },
  time: {
    fontSize: 11,
    fontFamily: Fonts.body,
  },
  timeMine: {
    color: 'rgba(255,255,255,0.7)',
  },
  timeTheirs: {
    color: Colors.textTertiary,
  },
  readIcon: {
    marginLeft: 1,
  },
});
