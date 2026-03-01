import React, { useState } from "react";
import { View, Text, StyleSheet, Image, StatusBar } from "react-native";
import { GiftedChat, Bubble, InputToolbar, Send, Composer } from "react-native-gifted-chat";
import axios from "axios";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {

  const [messages, setMessages] = useState([]);

  const onSend = async (newMessages = []) => {

    setMessages(previous => GiftedChat.append(previous, newMessages));

    const userMessage = newMessages[0].text;

    try {

      const res = await axios.post("http://192.168.0.119:8000/chat", {
        message: userMessage
      });
      console.log("Bot reply:", res);

      const botMessage = {
        _id: Math.random().toString(),
        text: res.data.reply,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "Groq AI"
        }
      };

      setMessages(previous => GiftedChat.append(previous, [botMessage]));

    } catch (error) {

      const errorMessage = {
        _id: Math.random().toString(),
        text: "⚠️ Server error. Please try again.",
        createdAt: new Date(),
        user: { _id: 2, name: "Groq AI" }
      };

      setMessages(previous => GiftedChat.append(previous, [errorMessage]));
    }
  };

  return (
    <SafeAreaProvider>

      <StatusBar
        barStyle="light-content"
        backgroundColor="#2979FF"
      />

      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Chat Bot</Text>
        </View>

        <View style={{ flex: 1 }}>
          <GiftedChat
            messages={messages}
            onSend={(messages) => onSend(messages)}
            user={{ _id: 1 }}
            keyboardShouldPersistTaps="handled"
            // bottomOffset={20}
            alwaysShowSend
            listViewProps={{
              style: { backgroundColor: "#121212" }
            }}

            renderBubble={(props) => (
              <Bubble
                {...props}
                wrapperStyle={{
                  right: {
                    backgroundColor: "#2979FF",
                    padding: 6
                  },
                  left: {
                    backgroundColor: "#2A2A2A",
                    padding: 6
                  }
                }}
                textStyle={{
                  right: { color: "#fff" },
                  left: { color: "#eee" }
                }}
              />
            )}

            renderInputToolbar={(props) => (
              <InputToolbar
                {...props}
                containerStyle={styles.inputToolbar}
              />
            )}

            renderComposer={(props) => (
              <Composer
                {...props}
                textInputStyle={styles.textInput}
                placeholder="Ask something..."
                placeholderTextColor="#888"
              />
            )}

            // renderSend={(props) => (
            //   <Send {...props}>
            //     <View style={styles.sendButton}>
            //       <Image
            //         source={require("./assets/send.png")}
            //         style={{ width: 18, height: 18, tintColor: "#fff" }}
            //       />
            //     </View>
            //   </Send>
            // )}

            renderSend={(props) => (
              <Send {...props} containerStyle={styles.sendContainer}>
                <View style={styles.sendButton}>
                  <Image
                    source={require("./assets/send.png")}
                    style={{ width: 18, height: 18, tintColor: "#fff" }}
                  />
                </View>
              </Send>
            )}
          />
        </View>

      </SafeAreaView>

    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#121212"
  },

  header: {
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#2979FF",
    alignItems: "center"
  },
  sendContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
    marginBottom: 2
  },

  sendButton: {
    backgroundColor: "#2979FF",
    borderRadius: 18,
    padding: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  headerText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold"
  },

  // inputToolbar: {
  //   position: "absolute",
  //   left: 0,
  //   right: 0,
  //   bottom: 35,
  //   marginHorizontal: 10,
  //   marginBottom: 15,
  //   borderRadius: 15,
  //   backgroundColor: "#1F1F1F",
  //   borderTopWidth: 0,
  //   elevation: 5
  // },
  inputToolbar: {
    marginHorizontal: 10,
    marginBottom: 45,
    borderRadius: 10,
    backgroundColor: "#1F1F1F",
    borderTopWidth: 0,
    paddingHorizontal: 5,
    paddingVertical: 4,
    alignItems: "center"
  },
  textInput: {
    flex: 1,
    backgroundColor: "#2A2A2A",
    color: "#fff",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    minHeight: 40
  },

});