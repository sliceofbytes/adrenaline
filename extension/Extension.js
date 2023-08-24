import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ChatBot from "./Chatbot";
import AuthModal from "./AuthModal";

class Repository {
  constructor(owner, name, branch="main") {
    this.owner = owner;
    this.name = name;
    this.branch = branch;
    this.fullPath = `${owner}/${name}`;
  }
}

const Extension = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [repository, setRepository] = useState(null);
  const { loginWithRedirect, isLoading, isAuthenticated } = useAuth0();
  const router = useRouter();

  // TODO: leave this for noe commented. It might be needed
  // useEffect(() => {
  //   getAuth0userInfoRequest()
  //     .then(res => {
  //       console.log({ res });
  //       setIsAuth(true);
  //     })
  //     .catch(e => {
  //       setIsAuth(false);
  //       console.log(e);
  //     });
  // });

  const onCloseModal = () => window.parent.postMessage('closeIframe', '*');

  useEffect(() => {
    if (router.isReady && Object.keys(router.query).length > 0) {
      const { owner, name } = router.query; // TODO: Pass in default branch as well, or get it from API
      setRepository(new Repository(owner, name));
    }
  }, [router.isReady, router.query])

  return (
    <div>
      {isModalOpen && (
        isAuthenticated ? (
          repository && (
            <ChatBot repository={repository} onCloseModal={onCloseModal} />
          )
        ) : (<AuthModal onCloseModal={onCloseModal} />)
      )}
    </div>
  );
};

export default Extension;