"use client";
import { useRouter } from "next/navigation";
import { Text, Button, Flex, Heading, VStack } from "../../common/design";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/src/lib/firebase/config";
import { getDoc, doc, DocumentData } from "firebase/firestore";
import { getPositionDifference } from "./utils";

import StepperComponent from "./StepperComponent";
import { defaultSteps } from "./StepperComponent";
import ProfileCard from "./ProfileCard";

export default function Page() {
  const [userData, setUser] = useState<DocumentData | null>(null);
  const [otherUserData, setOtherUser] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<"募集中" | "成立中" | "相乗り中" | "相乗り終了" | null>(null);
  const [ainoriData, setAinoriData] = useState<DocumentData | null>(null);
  const [userType, setUserType] = useState<"ドライバー" | "乗客" | null>(null);
  const router = useRouter();
  let isProcessing = false;

  const handleRideButton = async () => {
    if (isProcessing) return;
    isProcessing = true;
    const departureLat = 34.731922;
    const departureLon = 135.73168;
    try {
      const isNear = await getPositionDifference(departureLat, departureLon);
      if (isNear) {
        console.log("出発地から500m以内です。相乗りを開始します。");
        alert("出発地から500m以内です。相乗りを開始します。");
        setStatus("相乗り中");
      } else {
        console.log("出発地から離れています。");
        alert("出発地から離れています。");
      }
    } catch (error) {
      console.log("位置情報の取得に失敗しました。");
      alert("位置情報の取得に失敗しました。");
    } finally {
      isProcessing = false;
    }
  };

  const handleGetOffButton = async () => {
    if (isProcessing) return;
    isProcessing = true;
    const destinationLat = 34.7249499;
    const destinationLon = 135.7218884;
    try {
      const isNear = await getPositionDifference(destinationLat, destinationLon);
      if (isNear) {
        console.log("目的地から500m以内です。相乗りを完了します。");
        alert("目的地から500m以内です。相乗りを完了します。");
        setStatus("相乗り終了");
      } else {
        console.log("出発地から離れています。");
        alert("出発地から離れています。");
      }
    } catch (error) {
      console.error("位置情報の取得に失敗しました。");
      alert("位置情報の取得に失敗しました。");
    } finally {
      isProcessing = false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser(userData);
            const isAinori = userData!.isAinori;
            if (isAinori) {
              const ainoriDoc = await getDoc(doc(db, "ainories", isAinori));
              if (ainoriDoc.exists()) {
                const ainoriData = ainoriDoc.data();
                setAinoriData(ainoriData);
                setStatus(ainoriData.status);
                setUserType(ainoriData.driver === user.uid ? "ドライバー" : "乗客");
              }
              if (status === "成立中" || status === "相乗り中") {
                switch (userType) {
                  case "ドライバー":
                    const passengerDoc = await getDoc(doc(db, "users", ainoriData!.passenger));
                    if (passengerDoc.exists()) setOtherUser(passengerDoc.data());
                    break;
                  case "乗客":
                    const driverDoc = await getDoc(doc(db, "users", ainoriData!.driver));
                    if (driverDoc.exists()) setOtherUser(driverDoc.data());
                    break;
                }
              }
            }
            setLoading(false);
          }
        } catch (error) {
          console.log(error);
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Flex align="center" justify="center" height="100vh" flexDirection="column">
        <Heading>Loading...</Heading>
      </Flex>
    );
  }

  return (
    <Flex align="center" justify="center" height="100vh">
      <VStack spacing={5}>
        {status && <StepperComponent steps={defaultSteps} activeStep={status === "成立中" ? 0 : status === "相乗り中" ? 1 : 2} />}
        {(status === "成立中" || status === "相乗り中") && <ProfileCard name="鈴木 松" date="2024年7月17日" time="18:30" />}
        {status === "募集中" && <Text>現在相乗りを募集しています。</Text>}
        {ainoriData && <Text>ここに相乗り情報を表示。</Text>}
        {status === "成立中" && (
          <>
            <Heading>相乗りが成立しています。出発時刻に遅れないようにしましょう。</Heading>
            {userType === "ドライバー" ? (
              <Button onClick={() => { router.refresh(); }}>更新</Button>
            ) : (
              <>
                <Text>ドライバーと合流したら乗車するを押してください。</Text>
                <Button onClick={handleRideButton}>乗車する</Button>
              </>
            )}
          </>
        )}
        {status === "相乗り中" && (
          <>
            <Heading>相乗り中です。目的地まで安全に相乗りを楽しんで！</Heading>
            {userType === "ドライバー" ? (
              <Button onClick={() => { router.refresh(); }}>更新</Button>
            ) : (
              <>
                <Text>目的地に到着したら降車するを押してください</Text>
                <Button onClick={handleGetOffButton}>降車する</Button>
              </>
            )}
          </>
        )}
        {status === "相乗り終了" && userType === "乗客" && (
          <>
            <Heading>相乗りは完了しました！またのご利用お待ちしています！</Heading>
            <Text fontSize="3xl">別のページに移動してください</Text>
          </>
        )}
      </VStack>
    </Flex>
  );
}
