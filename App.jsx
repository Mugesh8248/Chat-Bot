import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import axios from "axios";
import {
  SafeAreaView,
  SafeAreaProvider
} from "react-native-safe-area-context";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const flatListRef = useRef(null);
  const userId = "EMP001";

  useEffect(() => {
    setMessages([
      {
        id: "1",
        text: "Please enter your mobile number",
        sender: "bot"
      }
    ]);
  }, []);

  const buildUiModel = (replyText) => {
    if (
      replyText.includes("Customer Name") &&
      replyText.includes("Contract Number")
    ) {
      const lines = replyText.split("\n").filter(line => line.trim());

      const greeting = lines[0];
      const data = {};

      lines.slice(1).forEach(line => {
        const parts = line.split(":");
        if (parts.length >= 2) {
          data[parts[0].trim()] = parts.slice(1).join(":").trim();
        }
      });

      return {
        renderType: "contract_card",
        greeting,
        data
      };
    }

    return {
      renderType: "text",
      text: replyText
    };
  };

  const sendMessage = async () => {
    if (!input.trim() || typing) return;

    const rawText = input.trim();

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text: rawText,
        sender: "user"
      }
    ]);

    setInput("");
    setTyping(true);

    try {
      const response = await axios.post(
        "http://192.168.29.199:8000/chat",
        {
          user_id: userId,
          message: rawText
        }
      );

      const uiData = buildUiModel(response.data.reply);

      console.log("uiData", uiData);

      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "bot",
          ui: uiData
        }
      ]);

    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          text: "⚠️ Unable to connect to server",
          sender: "bot"
        }
      ]);
    } finally {
      setTyping(false);
    }
  };

  const renderItem = ({ item }) => {

    if (item.ui?.renderType === "contract_card") {
      return (
        <View style={styles.mainCard}>

          <Text style={styles.greetingText}>
            {item.ui.greeting} 👋
          </Text>

          <Text style={styles.welcomeText}>
            Welcome to ServiceCare. I'm your personal assistant for all your AMC needs.
          </Text>

          <Text style={styles.sectionTitle}>AMC Contract Details</Text>

          <View style={styles.contractGrid}>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Customer</Text>
              <Text style={styles.infoValue}>
                {item.ui.data["Customer Name"]}
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Product</Text>
              <Text style={styles.infoValue}>
                {item.ui.data["Product"]}
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Warranty</Text>
              <Text style={styles.infoValue}>
                {item.ui.data["Product Warranty"]}
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Contract No</Text>
              <Text style={styles.infoValue}>
                {item.ui.data["Contract Number"]}
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Service</Text>
              <Text style={styles.infoValue}>
                {item.ui.data["Contract Product"]}
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>AMC Validity</Text>
              <Text style={styles.infoValue}>
                {item.ui.data["Contract Warranty"]}
              </Text>
            </View>

          </View>

        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageContainer,
          item.sender === "user"
            ? styles.userMessage
            : styles.botBubble
        ]}
      >
        <Text style={styles.messageText}>
          {item.text || item.ui?.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#050B18" />

      <SafeAreaView style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.wrapper}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "android" ? 25 : 0}
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>ServiceCare Assistant</Text>
              <Text style={styles.headerSub}>AI Powered • AMC Management</Text>
            </View>

            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
            />

            {typing && (
              <View style={styles.typingContainer}>
                <ActivityIndicator color="#4A63FF" />
                <Text style={styles.typingText}> AI typing...</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Ask about your AMC..."
                placeholderTextColor="#777"
                multiline
              />

              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Text style={styles.sendText}>➤</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050B18"
  },
  wrapper: {
    flex: 1
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1A2440"
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  },
  headerSub: {
    color: "#7AA2FF",
    fontSize: 12
  },
  listContent: {
    padding: 12,
    paddingBottom: 30,
    flexGrow: 1
  },
  messageContainer: {
    maxWidth: "78%",
    padding: 12,
    borderRadius: 14,
    marginVertical: 6
  },
  userMessage: {
    backgroundColor: "#4A63FF",
    alignSelf: "flex-end"
  },
  botBubble: {
    backgroundColor: "#111827",
    alignSelf: "flex-start",
    maxWidth: "85%",
    padding: 12,
    borderRadius: 14,
    marginVertical: 6
  },
  messageText: {
    color: "#fff",
    fontSize: 15
  },
  contractCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#1F2A44"
  },
  cardTitle: {
    color: "#7AA2FF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 14
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },
  label: {
    color: "#8B9DC3"
  },
  value: {
    color: "#fff",
    fontWeight: "600"
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    paddingBottom: Platform.OS === "android" ? 14 : 10,
    backgroundColor: "#0D1324"
  },
  input: {
    flex: 1,
    backgroundColor: "#111827",
    color: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16
  },
  sendButton: {
    backgroundColor: "#4A63FF",
    marginLeft: 10,
    width: 45,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14
  },
  sendText: {
    color: "#fff",
    fontSize: 18
  },
  typingContainer: {
    flexDirection: "row",
    paddingLeft: 15,
    paddingBottom: 6
  },
  typingText: {
    color: "#aaa"
  },
  mainCard: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 18,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#1F2A44"
  },

  greetingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10
  },

  welcomeText: {
    color: "#D1D5DB",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 18
  },

  sectionTitle: {
    color: "#7AA2FF",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 14
  },

  contractGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },

  infoBox: {
    width: "48%",
    backgroundColor: "#0D1324",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12
  },

  infoLabel: {
    color: "#8B9DC3",
    fontSize: 12,
    marginBottom: 6
  },

  infoValue: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14
  },
});