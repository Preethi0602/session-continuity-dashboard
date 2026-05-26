import { useState, useEffect } from 'react';
import { patientApi } from '../api/patientApi';
import type { Patient } from '../types/patient';

interface UsePatientReturn {
  patient: Patient | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePatient(patientId: string): UsePatientReturn {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching patient:', patientId); 
      const data = await patientApi.getSummary(patientId);
      console.log('Got data:', data); 
      setPatient(data);
    } catch (err) {
      console.error('Fetch failed:', err); 
      setError('Could not load patient data. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) fetchPatient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  return { patient, loading, error, refetch: fetchPatient };
}