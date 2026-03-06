import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWallet, fetchTransactions, deposit, transfer } from "../api/wallet";

export function useWallet() {
  const qc = useQueryClient();

  const walletQuery = useQuery({ queryKey: ["wallet"], queryFn: fetchWallet });
  const txQuery = useQuery({ queryKey: ["transactions"], queryFn: fetchTransactions });

  const depositMutation = useMutation({
    mutationFn: deposit,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wallet"] }); qc.invalidateQueries({ queryKey: ["transactions"] }); },
  });

  const transferMutation = useMutation({
    mutationFn: transfer,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wallet"] }); qc.invalidateQueries({ queryKey: ["transactions"] }); },
  });

  return { walletQuery, txQuery, depositMutation, transferMutation };
}
