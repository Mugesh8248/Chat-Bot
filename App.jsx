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


  const sendMessage = async () => {
    if (!input.trim() || typing) return;

    const rawText = input.trim();

    const userMessage = {
      id: Date.now().toString(),
      text: rawText,
      sender: "user"
    };

    setMessages(prev => [...prev, userMessage]);

    setInput("");
    setTyping(true);

    try {
      const response = await axios.post(
        "http://192.168.29.199:8000/chat",
        {
          user_id: userId,
          message: rawText
        },
        {
          headers: {
            "Content-Type": "application/json"
          },
          timeout: 10000
        }
      );

      console.log("Bot response", response);

      const botMessage = {
        id: Math.random().toString(),
        text: response.data.reply || "⚠️ No reply from AI",
        sender: "bot"
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
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

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "user"
          ? styles.userMessage
          : styles.botMessage
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#2979FF" />

      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.wrapper}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "android" ? 35 : 0}
          >
            <View style={styles.header}>
              <Text style={styles.headerText}>Service Chat Bot</Text>
            </View>

            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
            />

            {typing && (
              <View style={styles.typingContainer}>
                <ActivityIndicator size="small" color="#2979FF" />
                <Text style={styles.typingText}> AI typing...</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Type here..."
                placeholderTextColor="#888"
                multiline
                returnKeyType="send"
                onSubmitEditing={sendMessage}
              />

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  typing && { opacity: 0.5 }
                ]}
                onPress={sendMessage}
                disabled={typing}
              >
                <Text style={styles.sendText}>Send</Text>
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
    backgroundColor: "#121212"
  },
  wrapper: {
    flex: 1
  },
  header: {
    backgroundColor: "#2979FF",
    padding: 15,
    alignItems: "center"
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  },
  listContent: {
    padding: 10,
    paddingBottom: 20,
  },
  messageContainer: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5
  },
  userMessage: {
    backgroundColor: "#2979FF",
    alignSelf: "flex-end"
  },
  botMessage: {
    backgroundColor: "#2A2A2A",
    alignSelf: "flex-start"
  },
  messageText: {
    color: "#fff"
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#1F1F1F",
    alignItems: "center"
  },
  input: {
    flex: 1,
    backgroundColor: "#2A2A2A",
    color: "#fff",
    borderRadius: 20,
    paddingHorizontal: 15,
    minHeight: 45,
    maxHeight: 100
  },
  sendButton: {
    backgroundColor: "#2979FF",
    marginLeft: 10,
    borderRadius: 20,
    justifyContent: "center",
    paddingHorizontal: 15,
    height: 45
  },
  sendText: {
    color: "#fff",
    fontWeight: "bold"
  },
  typingContainer: {
    flexDirection: "row",
    paddingLeft: 15,
    paddingBottom: 5
  },
  typingText: {
    color: "#aaa"
  }
});