async function getValuesFromMetaMask() {
  const state = await wallet.request({
    method: 'snap_manageState',
    params: ['get'],
  });
  return state?.passwords ?? {};
}

async function getParticularWalletKey(username) {
  const values = await getValuesFromMetaMask();
  return values?.[username] ?? 'USERNAME_NOT_FOUND';
}

async function saveNewValueInMetamask({ username, seed }) {
  const oldValues = await getValuesFromMetaMask();

  if (oldValues?.[username]) {
    return 'USERNAME_ALREADY_EXISTS';
  }

  await wallet.request({
    method: 'snap_manageState',
    params: ['update', { passwords: { ...oldValues, [username]: seed } }],
  });

  return 'SUCCESS';
}

module.exports.onRpcRequest = async ({ origin, request }) => {
  switch (request.method) {
    case 'save_password': {
      const { username, seed } = request;
      const response = await saveNewValueInMetamask({ username, seed });
      return response;
    }
    case 'search': {
      const { username } = request;
      return getParticularWalletKey(username);
    }
    case 'get_stored_accounts': {
      const data = await getValuesFromMetaMask();
      return data ? Object.keys(data).map((k) => k) : [];
    }
    case 'get_seed': {
      const { username } = request;
      const state = await getValuesFromMetaMask();

      const showPassword = await wallet.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: 'Confirm password request?',
            description: 'Do you want to display the password in plaintext?',
            textAreaContent: `The DApp "${origin}" is asking for your secret.`,
          },
        ],
      });

      if (!showPassword) {
        return 'DENIED';
      }

      return state[username];
    }
    case 'clear': {
      await wallet.request({
        method: 'snap_manageState',
        params: ['update', {}],
      });
      return 'DONE';
    }
    default: {
      throw new Error('METHOD_NOT_FOUND');
    }
  }
};
