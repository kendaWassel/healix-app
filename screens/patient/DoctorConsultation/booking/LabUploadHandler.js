import {useState} from "react";
import UploadSection from "../../../Components/LabAnalysis/uploadSection";
import {View,Text} from "react-native";

import {useLabAnalysis} from "../../../Components/LabAnalysis/useLabAnalysis";
import { useTranslation } from "react-i18next";

export default function LabUploadHandler({
 onFinished
}){

const {
 file,
 setFile,
 analyze,
 loading
}=useLabAnalysis();


const [started,setStarted]=useState(false);
const { t } = useTranslation();

const handleAnalyze=async()=>{

 setStarted(true);

 await analyze();

 onFinished();

};


return (

<View>

<UploadSection

file={file}

setFile={setFile}

loading={loading}

onAnalyze={handleAnalyze}

/>


{
loading &&
<Text>
{t("labAnalysis.waitingMessage")}
</Text>
}


</View>

)

}