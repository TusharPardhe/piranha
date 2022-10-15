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

async function saveNewValueInMetamask(value) {
  const oldValues = await getValuesFromMetaMask();

  if (oldValues?.[value.username]) return 'USERNAME_ALREADY_EXISTS';

  await wallet.request({
    method: 'snap_manageState',
    params: ['update', { passwords: { ...oldValues, ...value } }],
  });
}

const onRpcRequest = async ({ origin, request }) => {
  switch (request.method) {
    case 'save_password': {
      const { username, secret } = request;
      await saveNewValueInMetamask({ username, secret });
      return 'DONE';
    }
    case 'search': {
      const { username } = request;
      return getParticularWalletKey(username);
    }
    case 'get_password': {
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

module.exports = onRpcRequest;
