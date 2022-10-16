import React from 'react';
import { Wallet } from 'xrpl';
import useMergedState from '../../hooks/userMergedState';

const HOME_COMPONENT_INITIAL_STATE = {
  seed: '',
  address: '',
  username: '',
  stored_usernames: [],
};

const Home = () => {
  const [state, setState] = useMergedState(HOME_COMPONENT_INITIAL_STATE);

  const { seed, address, username, stored_usernames } = state;

  const snapId = `local:http://localhost:8080`;

  const onGenerateBtnClick = () => {
    const randomAddress = Wallet.generate();
    const { classicAddress: address, seed } = randomAddress;
    setState({ address, seed });
  };

  const connect = async () => {
    try {
      // eslint-disable-next-line no-undef
      const result = await ethereum.request({
        method: 'wallet_enable',
        params: [
          {
            wallet_snap: {
              [snapId]: {},
            },
          },
        ],
      });
      alert('Success');
      console.log(result);
    } catch (error) {
      if (error.code === 4001) {
        alert('The user rejected the request.');
      } else {
        console.log('Unexpected error:', error);
        alert('Unexpected error occurred.');
      }
    }
  };

  const getStoredSeedValue = async (name) => {
    // eslint-disable-next-line no-undef
    const response = await ethereum.request({
      method: 'wallet_invokeSnap',
      params: [snapId, { method: 'get_seed', username: name }],
    });

    console.log(response);
  };

  const savePassword = async () => {
    // eslint-disable-next-line no-undef
    const response = await ethereum.request({
      method: 'wallet_invokeSnap',
      params: [snapId, { method: 'save_password', username, seed }],
    });
    console.log(response);
  };

  const connectBtnClick = async () => {
    await connect();
  };

  const getWallets = async () => {
    // eslint-disable-next-line no-undef
    const result = await ethereum.request({
      method: 'wallet_invokeSnap',
      params: [snapId, { method: 'get_stored_accounts' }],
    });
    console.log(result);
    setState({ stored_usernames: result });
  };

  return (
    <div className="home_container">
      <button onClick={connectBtnClick}>Install Snap</button>
      <button onClick={onGenerateBtnClick}>Generate Wallet</button>
      {address && (
        <>
          <div className="generated_wallet_details">
            <h3 className="address">{address}</h3>
            <h3 className="seed">{seed}</h3>
          </div>
          <div className="store_wallet_details_container">
            <input
              type="text"
              placeholder="Enter wallet username"
              value={username}
              onChange={(e) => setState({ username: e.target.value })}
            />
            <button onClick={savePassword} disabled={username.length === 0}>
              Save Wallet
            </button>
          </div>
        </>
      )}

      <button onClick={getWallets}>Get All Wallets</button>
      <ul>
        {stored_usernames.map((name) => (
          <li key={`${name}_${name}`} onClick={() => getStoredSeedValue(name)}>
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
