import { useUser } from "@/context/UserContext";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

const C = {
  bg: '#F5F4F0',
  card: '#FFFFFF',
  border: '#E2E0D8',
  text: '#1A1A18',
  textMuted: '#7A7870',
  addBg: '#1A1A18',
  addText: '#FFFFFF',
  unreadBg: '#ECEAE4',
};

function BellIcon({ size = 20, color = '#1A1A18' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.73 21a2 2 0 0 1-3.46 0"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function formatTimestamp(ts: number) {
  const date = new Date(ts);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function Notifications() {
  const { userInfo } = useUser();
  const notifications = userInfo.current.notifications ?? [];

  if (notifications.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <BellIcon size={28} color="#7A7870" />
        </View>
        <Text style={styles.emptyTitle}>No notifications yet</Text>
        <Text style={styles.emptySubtitle}>
          You'll see updates about your claims and sessions here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={notifications}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item, index }) => {
          const isUnread = index < 2;
          return (
            <TouchableOpacity
              style={[styles.item, isUnread && styles.itemUnread]}
              activeOpacity={0.7}
            >
              {/* Unread dot */}
              <View style={styles.dotCol}>
                {isUnread && <View style={styles.unreadDot} />}
              </View>

              {/* Icon */}
              <View style={[styles.iconCircle, isUnread && styles.iconCircleUnread]}>
                <BellIcon size={18} color={isUnread ? '#1A1A18' : '#7A7870'} />
              </View>

              {/* Content */}
              <View style={styles.content}>
                <View style={styles.topRow}>
                  <Text
                    style={[styles.title, isUnread && styles.titleUnread]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.time}>{formatTimestamp(item.timestamp)}</Text>
                </View>
                <Text style={styles.message} numberOfLines={2}>
                  {item.message}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  list: {
    paddingVertical: 8,
  },
  separator: {
    height: 1,
    backgroundColor: C.border,
    marginLeft: 72,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: C.card,
    gap: 12,
  },
  itemUnread: {
    backgroundColor: C.unreadBg,
  },
  dotCol: {
    width: 8,
    alignItems: 'center',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.addBg,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleUnread: {
    backgroundColor: '#D8D5CC',
  },
  content: {
    flex: 1,
    gap: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: C.text,
  },
  titleUnread: {
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    color: C.textMuted,
    flexShrink: 0,
  },
  message: {
    fontSize: 13,
    color: C.textMuted,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: C.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});