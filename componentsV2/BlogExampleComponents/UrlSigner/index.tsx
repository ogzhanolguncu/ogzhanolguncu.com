import {
  Alert,
  AlertDescription,
  Button,
  Flex,
  Input,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import signed from "./util";

const signer = signed({ secret: "very-secret-key", ttl: 3600 });

export const URLSigner = () => {
  const {
    isOpen: isVisible,
    onOpen,
    onClose,
  } = useDisclosure({
    defaultIsOpen: false,
  });

  const [url, setUrl] = useState<string>();
  const [signedUrl, setSignedUrl] = useState<string>();
  const [TTLVal, setTTLVal] = useState<number>(3600);
  const [isVerified, setIsVerified] = useState<
    "verified" | "none" | "invalid" | "expired"
  >("none");

  const handleSigning = () => {
    url && setSignedUrl(signer.sign(url, TTLVal));
    setIsVerified("none");
    onOpen();
  };
  const handleVerify = () => {
    try {
      const isVerified = url && signer.verify(url);
      if (isVerified) setIsVerified("verified");
    } catch (error) {
      console.log({ error });
      if ((error as Error).message === "Invalid") {
        setIsVerified("invalid");
      }
      if ((error as Error).message === "Expired") {
        setIsVerified("expired");
      }
    } finally {
      onClose();
    }
  };
  console.log({ isVerified });
  return (
    <Flex
      flexDirection="column"
      boxShadow="outline"
      rounded="md"
      width="50%"
      padding="1rem"
      bg="white"
      gap="1rem"
    >
      {isVisible && (
        <Alert
          status="success"
          display="flex"
          justifyContent="center"
          borderRadius="md"
          shadow="sm"
        >
          <AlertDescription>
            <Text fontSize="1rem" fontWeight="600" color="blackAlpha.800">
              {signedUrl && signedUrl}
            </Text>
          </AlertDescription>
        </Alert>
      )}
      {(isVerified === "verified" ||
        isVerified === "invalid" ||
        isVerified === "expired") && (
        <Alert
          status={
            isVerified === "invalid" || isVerified === "expired"
              ? "error"
              : "success"
          }
          display="flex"
          justifyContent="center"
          borderRadius="md"
          shadow="sm"
        >
          <AlertDescription>
            <Text fontSize="1rem" fontWeight="600">
              {isVerified === "invalid" && "Invalid!"}
              {isVerified === "expired" && "Expired!"}
              {isVerified !== "invalid" &&
                isVerified === "expired" &&
                "Looks good!"}
            </Text>
          </AlertDescription>
        </Alert>
      )}
      <Text fontSize="1rem" fontWeight="600">
        Current TTL: {TTLVal}
      </Text>
      <Input
        variant="filled"
        placeholder="Custom TTL Value"
        onChange={(e) => setTTLVal(Number(e.target.value))}
      />
      <Flex gap="1rem">
        <Input
          variant="filled"
          placeholder="Give me any URL and I'll sign it"
          onChange={(e) => setUrl(e.currentTarget.value)}
        />
        <Button onClick={handleSigning}>Sign It</Button>
      </Flex>
      <Flex gap="1rem">
        <Input
          variant="filled"
          placeholder="Give me any URL and I'll verify it"
          onChange={(e) => setUrl(e.currentTarget.value)}
        />
        <Button onClick={handleVerify}>Verify It</Button>
      </Flex>
    </Flex>
  );
};
