import styles from "../../styles/ActivityFeed.module.css";
import {
  CITY_COIN_CORE_ADDRESS,
  CITY_COIN_CORE_CONTRACT_NAME,
  API_BASE_NET_URL,
  NETWORK_STRING,
} from "../../lib/constants";
import { useState, useEffect } from "react";

const ActivityFeed = () => {
  const url =
    API_BASE_NET_URL +
    "extended/v1/address/" +
    CITY_COIN_CORE_ADDRESS +
    "." +
    CITY_COIN_CORE_CONTRACT_NAME +
    "/transactions?limit=5";

  const [transactionData, setTransactionData] = useState();

  useEffect(() => {
    getTransactionData().then((result) => setTransactionData(result.results));
  }, []);

  const getTransactionData = async () => {
    const res = await fetch(url);
    const result = await res.json();
    return result;
  };

  const activityElements = [];

  function getTokenType(contract) {
    let type = "";
    switch (contract) {
      case "stack-tokens":
        type = "$MIA";
        break;
      default:
        type = "STX";
    }
    return type;
  }

  if (transactionData != null) {
    for (let i = 0; i < 5; i++) {
      const activity = transactionData[i];
      const transaction = {
        tx_id: activity.tx_id,
        tx_status: activity.tx_status,
        sender_address: activity.sender_address,
        contract_call: activity.contract_call.function_name,
        type: getTokenType(activity.contract_call.function_name),

        amount:
          activity.contract_call.function_name == "register-user"
            ? 0
            : activity.post_conditions[0].amount,
      };
      if (transaction.type == "STX")
        transaction.amount = transaction.amount / 1000000;
      if (transaction.sender_address.length > 14)
        transaction.sender_address =
          transaction.sender_address.substring(0, 14) + "...";

      let status = "";
      switch (transaction.tx_status) {
        case "success":
          status = styles.success;
          break;
        case "pending":
          status = style.pending;
        default:
          status = styles.failed;
      }
      switch (transaction.contract_call) {
        case "mine-tokens":
        case "mine-many":
          transaction.contract_call = "Mine";
          break;
        case "claim-mining-reward":
        case "claim-stacking-reward":
          transaction.contract_call = "Redeem";
          break;
        case "register-user":
          transaction.contract_call = "Register";
          break;
        case "shutdown-contract":
          transaction.contract_call = "Shutdown";
          break;
        case "set-city-wallet":
          transaction.contract_call = "City";
          break;
        case "stack-tokens":
          transaction.contract_call = "Stack";
          break;
        default:
          transaction.contract_call = "Undefined";
      }

      const url = `https://explorer.stacks.co/txid/${transaction.tx_id}?chain=${NETWORK_STRING}`;
      activityElements.push(
        <a href={url} target="_blank" rel="noopener noreferrer">
          <div>
            <a id={status} className={styles.token}>
              {transaction.amount + " " + transaction.type}
            </a>
            <a className={styles.contract}>{transaction.contract_call}</a>
            <a className={styles.address}>{transaction.sender_address}</a>
          </div>
        </a>
      );
    }
  }

  return (
    <div className={styles.activity}>
      <h1>Activity feed</h1>
      {transactionData && activityElements}
    </div>
  );
};

export default ActivityFeed;
