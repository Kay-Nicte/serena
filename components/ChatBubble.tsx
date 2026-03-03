import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Fonts } from '@/constants/fonts';
import { ImageViewer } from './ImageViewer';
import { AudioPlayer } from './AudioPlayer';
import { REACTIONS } from './ReactionPicker';
import type { MessageReaction } from '@/stores/chatStore';

interface ChatBubbleProps {
  content: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  isMine: boolean;
  timestamp: string;
  readAt?: string | null;
  showReadReceipt?: boolean;
  reactions?: MessageReaction[];
  userId?: string | null;
  onLongPress?: (y: number, x: number) => void;
}

function formatTime(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getReactionIcon(key: string): string {
  return REACTIONS.find((r) => r.key === key)?.iconFilled ?? 'heart';
}

function isGif(url: string): boolean {
  return url.includes('giphy.com') || url.toLowerCase().endsWith('.gif');
}

export function ChatBubble({
  content,
  imageUrl,
  audioUrl,
  isMine,
  timestamp,
  readAt,
  showReadReceipt = false,
  reactions = [],
  userId,
  onLongPress,
}: ChatBubbleProps) {
  const [viewerVisible, setViewerVisible] = useState(false);
  const Colors = useColors();
  const styles = makeStyles(Colors);

  const handleLongPress = (e: any) => {
    const { pageY, pageX } = e.nativeEvent;
    onLongPress?.(pageY, pageX);
  };

  // Group reactions by emoji and count
  const reactionGroups = reactions.reduce<Record<string, { count: number; isMine: boolean }>>((acc, r) => {
    if (!acc[r.reaction]) acc[r.reaction] = { count: 0, isMine: false };
    acc[r.reaction].count++;
    if (r.userId === userId) acc[r.reaction].isMine = true;
    return acc;
  }, {});

  const hasReactions = Object.keys(reactionGroups).length > 0;

  return (
    <View style={[styles.container, isMine ? styles.mine : styles.theirs]}>
      <Pressable
        onLongPress={handleLongPress}
        delayLongPress={300}
        style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs, imageUrl ? styles.bubbleImage : undefined]}
      >
        {audioUrl ? (
          <AudioPlayer uri={audioUrl} isMine={isMine} />
        ) : imageUrl ? (
          isGif(imageUrl) ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.gif}
              contentFit="cover"
              autoplay
            />
          ) : (
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
          )
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
      </Pressable>

      {hasReactions && (
        <View style={[styles.reactionsRow, isMine ? styles.reactionsRowMine : styles.reactionsRowTheirs]}>
          {Object.entries(reactionGroups).map(([key, { count, isMine: myReaction }]) => (
            <View key={key} style={[styles.reactionBadge, myReaction && styles.reactionBadgeMine]}>
              <Ionicons name={getReactionIcon(key) as any} size={13} color={Colors.primary} />
              {count > 1 && (
                <Text style={styles.reactionCount}>{count}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function makeStyles(c: ReturnType<typeof useColors>) {
  return StyleSheet.create({
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
      backgroundColor: c.primary,
      borderBottomRightRadius: 4,
    },
    bubbleTheirs: {
      backgroundColor: c.surfaceSecondary,
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
    gif: {
      width: 200,
      height: 160,
      borderRadius: 14,
    },
    text: {
      fontSize: 15,
      fontFamily: Fonts.body,
      lineHeight: 21,
    },
    textMine: {
      color: c.textOnPrimary,
    },
    textTheirs: {
      color: c.text,
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
      color: c.textTertiary,
    },
    readIcon: {
      marginLeft: 1,
    },
    reactionsRow: {
      flexDirection: 'row',
      gap: 4,
      marginTop: -2,
      paddingHorizontal: 4,
    },
    reactionsRowMine: {
      justifyContent: 'flex-end',
    },
    reactionsRowTheirs: {
      justifyContent: 'flex-start',
    },
    reactionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: c.surface,
      borderRadius: 12,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderWidth: 1,
      borderColor: c.borderLight,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 1,
    },
    reactionBadgeMine: {
      borderColor: c.primaryLight,
      backgroundColor: c.primaryPastel,
    },
    reactionCount: {
      fontSize: 11,
      fontFamily: Fonts.bodyMedium,
      color: c.textSecondary,
    },
  });
}
