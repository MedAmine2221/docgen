"use client";;
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { getMe } from '@/redux/actions/auth/login';
import { fetchDocs } from '@/redux/actions/docs/getDocs';
import { fetchUsers } from '@/redux/actions/users/getUsers';
import { RootState } from '@/redux/store';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function RefetchDataProviders({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const docsList = useSelector((state: RootState) => state.docs.docs);
  const usersList = useSelector((state: RootState) => state.users.users);
  const me = useSelector((state: RootState) => state.profil.profil);
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (!docsList || docsList.length === 0) {
      dispatch(fetchDocs());
    }
  }, [dispatch, docsList]);

  useEffect(() => {
    if (!me) {
      dispatch(getMe());
    }
  }, [dispatch, me]);


  useEffect(() => {
    if (!usersList || usersList.length === 0) {
      dispatch(fetchUsers());
    }
  }, [dispatch, usersList]);
  return(
    <>
      {children}
    </>
)}
