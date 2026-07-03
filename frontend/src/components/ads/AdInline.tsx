import { Center, Text } from "@chakra-ui/react";
import { t } from "@/lib/i18n";

export function AdInline() {
  return (
    <Center
      className="no-print"
      borderWidth="1px"
      borderStyle="dashed"
      borderColor="border.emphasized"
      borderRadius="md"
      minHeight="64px"
      bg="bg.subtle"
    >
      <Text fontSize="xs" color="fg.subtle">
        {t.ads.inline}
      </Text>
    </Center>
  );
}
