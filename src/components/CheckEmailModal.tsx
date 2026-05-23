"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";

type CheckEmailModalProps = {
  open: boolean;
};

export function CheckEmailModal({ open }: CheckEmailModalProps) {
  const router = useRouter();

  function handleClose() {
    router.replace("/auth/login");
  }

  return (
    <Modal open={open} onClose={handleClose} title="Controlla la casella">
      <p>
        Ti abbiamo inviato un&apos;email di conferma. Apri il link per attivare
        l&apos;account, poi accedi con email e password.
      </p>
    </Modal>
  );
}
