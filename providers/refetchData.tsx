"use client";
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { getMe } from '@/redux/actions/auth/login';
import { fetchDocs } from '@/redux/actions/docs/getDocs';
import { fetchUsers } from '@/redux/actions/users/getUsers';
import { RootState } from '@/redux/store';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function RefetchDataProviders({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const docsList = useSelector((state: RootState) => state.docs.docs);
  const usersList = useSelector((state: RootState) => state.users.users);
  const me = useSelector((state: RootState) => state.profil.profil);
  
  const dispatch = useAppDispatch();
  const [isTokenReady, setIsTokenReady] = useState(false);

  // Check if token exists before fetching
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token");
      setIsTokenReady(!!token);
    };
    
    checkToken();
    window.addEventListener("tokenChange", checkToken);
    window.addEventListener("storage", checkToken);
    
    return () => {
      window.removeEventListener("tokenChange", checkToken);
      window.removeEventListener("storage", checkToken);
    };
  }, []);

  // Only fetch when token is ready AND data is missing
  useEffect(() => {
    if (isTokenReady && (!docsList || docsList.length === 0)) {
      dispatch(fetchDocs());
    }
  }, [dispatch, docsList, isTokenReady]);

  useEffect(() => {
    if (isTokenReady && !me) {
      dispatch(getMe());
    }
  }, [dispatch, me, isTokenReady]);

  useEffect(() => {
    if (isTokenReady && (!usersList || usersList.length === 0)) {
      dispatch(fetchUsers());
    }
  }, [dispatch, usersList, isTokenReady]);

  return <>{children}</>;
}