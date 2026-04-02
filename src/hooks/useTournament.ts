import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Tournament, TournamentParticipant } from '../types';

/** Real-time tek turnuva + katılımcı dinleyici */
export function useTournament(id: string | undefined) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Turnuva dinleyici
    const unsubTournament = onSnapshot(
      doc(db, 'tournaments', id),
      (snap) => {
        if (snap.exists()) {
          setTournament(snap.data() as Tournament);
        } else {
          setError('Turnuva bulunamadı.');
        }
        setLoading(false);
      },
      () => {
        setError('Turnuva yüklenirken hata oluştu.');
        setLoading(false);
      }
    );

    // Katılımcılar dinleyici
    const unsubParticipants = onSnapshot(
      collection(db, 'tournaments', id, 'participants'),
      (snap) => {
        setParticipants(snap.docs.map(d => d.data() as TournamentParticipant));
      }
    );

    return () => {
      unsubTournament();
      unsubParticipants();
    };
  }, [id]);

  return { tournament, participants, loading, error };
}
