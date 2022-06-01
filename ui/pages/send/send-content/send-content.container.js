import { connect } from 'react-redux';
import {
  getIsEthGasPriceFetched,
  getNoGasPriceFetched,
  checkNetworkOrAccountNotSupports1559,
} from '../../../selectors';
import {
  getIsBalanceInsufficient,
  getSendAsset,
  getAssetError,
} from '../../../ducks/send';

import SendContent from './send-content.component';

function mapStateToProps(state) {
  return {
    isEthGasPrice: getIsEthGasPriceFetched(state),
    noGasPrice: getNoGasPriceFetched(state),
    networkOrAccountNotSupports1559: checkNetworkOrAccountNotSupports1559(
      state,
    ),
    getIsBalanceInsufficient: getIsBalanceInsufficient(state),
    asset: getSendAsset(state),
    assetError: getAssetError(state),
  };
}

export default connect(mapStateToProps)(SendContent);
