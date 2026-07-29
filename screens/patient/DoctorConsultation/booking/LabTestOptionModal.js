import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";

import { useTranslation } from "react-i18next";

export default function LabTestOptionModal({
  isOpen,
  onClose,
  onChoose,
  processing,
}) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>

          <Text style={styles.title}>
            {t("labOption.uploadQuestion")}
          </Text>


          {processing ? (
            <Text style={styles.processing}>
              {t("labOption.processing")}
            </Text>
          ) : (
            <View style={styles.buttons}>

              <TouchableOpacity
                style={styles.yes}
                onPress={() => onChoose("yes")}
              >
                <Text style={styles.text}>
                  {t("common.yes")}
                </Text>
              </TouchableOpacity>


              <TouchableOpacity
                style={styles.no}
                onPress={() => onChoose("no")}
              >
                <Text style={styles.noText}>
                  {t("common.no")}
                </Text>
              </TouchableOpacity>

            </View>
          )}

        </View>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({

overlay:{
 flex:1,
 backgroundColor:"rgba(5,36,67,.5)",
 justifyContent:"center",
 alignItems:"center"
},

card:{
 backgroundColor:"#fff",
 width:"90%",
 borderRadius:16,
 padding:25,
 alignItems:"center"
},

title:{
 fontSize:18,
 fontWeight:"600",
 textAlign:"center",
 marginBottom:25
},

buttons:{
 width:"100%",
 gap:12
},

yes:{
 backgroundColor:"#052443",
 padding:14,
 borderRadius:10,
 alignItems:"center"
},

no:{
 borderWidth:1,
 borderColor:"#ddd",
 padding:14,
 borderRadius:10,
 alignItems:"center"
},

text:{
 color:"#fff",
 fontWeight:"600"
},

noText:{
 color:"#374151",
 fontWeight:"600"
},

processing:{
 color:"#0e7490",
 fontWeight:"600",
 textAlign:"center"
}

});