import React, {Component} from 'react';
import {Platform} from 'react-native';
import {
  eSubscribeEvent,
  eUnSubscribeEvent,
  openVault,
  eSendEvent,
} from '../../services/eventManager';
import {
  eCloseActionSheet,
  eCloseAddNotebookDialog,
  eCloseAddTopicDialog,
  eCloseLoginDialog,
  eCloseMoveNoteDialog,
  eCloseSimpleDialog,
  eOnLoadNote,
  eOpenActionSheet,
  eOpenAddNotebookDialog,
  eOpenAddTopicDialog,
  eOpenLoginDialog,
  eOpenMoveNoteDialog,
  eOpenSimpleDialog,
  eOpenPremiumDialog,
  eClosePremiumDialog,
  eOpenExportDialog
} from '../../services/events';
import {DDS, hexToRGBA} from '../../utils/utils';
import ActionSheet from '../ActionSheet';
import {ActionSheetComponent} from '../ActionSheetComponent';
import {AddNotebookDialog} from '../AddNotebookDialog';
import {AddTopicDialog} from '../AddTopicDialog';
import {Dialog} from '../Dialog';
import MergeEditor from '../MergeEditor';
import {VaultDialog} from '../VaultDialog';
import {moveNoteEvent} from './recievers';
import {TEMPLATE_DELETE, TEMPLATE_PERMANANT_DELETE} from './templates';
import MoveNoteDialog from '../MoveNoteDialog';
import LoginDialog from '../LoginDialog';
import PremiumDialog from '../Premium/PremiumDialog';
import ExportDialog from '../ExportDialog';

export class DialogManager extends Component {
  constructor(props) {
    super(props);
    this.actionSheet;
    this.opened = false;
    this.state = {
      item: {},
      actionSheetData: {
        colors: false,
        tags: false,
        rowItems: [],
        columnItems: [],
      },
      simpleDialog: {
        title: '',
        paragraph: '',
        positiveText: '',
        negativeText: '',
        action: 0,
        icon: '',
      },
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      JSON.stringify(nextProps) !== JSON.stringify(this.props) ||
      nextState !== this.state
    );
  }

  _showActionSheet = data => {
    this.setState(
      {
        actionSheetData: data,
        item: data.item ? data.item : {},
      },
      () => {
        this.actionSheet._setModalVisible();
      },
    );
  };

  _hideActionSheet = () => {
    this.actionSheet._setModalVisible();
  };

  _showMoveNote = () => {
    this.moveNoteDialog.open();
  };

  _hideMoveNote = () => {
    this.moveNoteDialog.close();
  };

  loadNote = i => {
    if (i && i.type === 'new') {
      this.setState({
        item: {},
      });
    } else {
      note = i;
      this.setState({
        item: i,
      });
    }
  };

  showAddTopic = notebook => {
    if (notebook) {
      this.setState({
        item: notebook,
      });
    }

    this.addTopicsDialog.open();
  };

  hideAddTopic = () => {
    this.addTopicsDialog.close();
  };

  componentDidMount() {
    eSubscribeEvent(eOnLoadNote, this.loadNote);

    eSubscribeEvent(eOpenActionSheet, this._showActionSheet);
    eSubscribeEvent(eCloseActionSheet, this._hideSimpleDialog);

    eSubscribeEvent(eOpenSimpleDialog, this._showSimpleDialog);
    eSubscribeEvent(eCloseSimpleDialog, this._hideSimpleDialog);

    eSubscribeEvent(eOpenMoveNoteDialog, this._showMoveNote);
    eSubscribeEvent(eCloseMoveNoteDialog, this._hideMoveNote);

    eSubscribeEvent(eOpenAddNotebookDialog, this.showAddNotebook);
    eSubscribeEvent(eCloseAddNotebookDialog, this.hideAddNotebook);

    eSubscribeEvent(eOpenAddTopicDialog, this.showAddTopic);
    eSubscribeEvent(eCloseAddTopicDialog, this.hideAddTopic);

    eSubscribeEvent(eOpenLoginDialog, this.showLoginDialog);
    eSubscribeEvent(eCloseLoginDialog, this.hideLoginDialog);
    
    eSubscribeEvent(eOpenPremiumDialog, this.showPremiumDialog);
    eSubscribeEvent(eClosePremiumDialog, this.hidePremiumDialog);
  }

  componentWillUnmount() {
    eUnSubscribeEvent(eOnLoadNote, this.loadNote);

    eUnSubscribeEvent(eOpenActionSheet, this._showActionSheet);
    eUnSubscribeEvent(eCloseActionSheet, this._hideSimpleDialog);

    eUnSubscribeEvent(eOpenSimpleDialog, this._showSimpleDialog);
    eUnSubscribeEvent(eCloseSimpleDialog, this._hideSimpleDialog);

    eUnSubscribeEvent(eOpenMoveNoteDialog, this._showMoveNote);
    eUnSubscribeEvent(eCloseMoveNoteDialog, this._hideMoveNote);

    eUnSubscribeEvent(eOpenAddNotebookDialog, this.showAddNotebook);
    eUnSubscribeEvent(eCloseAddNotebookDialog, this.hideAddNotebook);

    eUnSubscribeEvent(eOpenAddTopicDialog, this.showAddTopic);
    eUnSubscribeEvent(eCloseAddTopicDialog, this.hideAddTopic);

    eUnSubscribeEvent(eOpenLoginDialog, this.showLoginDialog);
    eUnSubscribeEvent(eCloseLoginDialog, this.hideLoginDialog);

    eUnSubscribeEvent(eOpenPremiumDialog, this.showPremiumDialog);
    eUnSubscribeEvent(eClosePremiumDialog, this.hidePremiumDialog);
  }

  showPremiumDialog = () => {
    this.premiumDialog.open();
  };

  hidePremiumDialog = () => {
    this.premiumDialog.close();
  };
  

  showLoginDialog = () => {
    this.loginDialog.open();
  };

  hideLoginDialog = () => {
    this.loginDialog.close();
  };

  showAddNotebook = data => {
    this.setState(
      {
        item: data.item ? data.item : {},
      },
      () => {
        this.addNotebooksDialog.open();
      },
    );
  };
  hideAddNotebook = () => {
    this.addNotebooksDialog.close();
  };

  _showSimpleDialog = data => {
    this.setState(
      {
        simpleDialog: data,
      },
      () => {
        this.simpleDialog.show();
      },
    );
  };
  _hideSimpleDialog = data => {
    this.simpleDialog.hide();
  };

  onActionSheetHide = () => {
    if (this.show) {
      switch (this.show) {
        case 'delete': {
          if (this.state.item.locked) {
            openVault(this.state.item, true, true, false, false, false, true);
          } else {
            this._showSimpleDialog(TEMPLATE_DELETE(this.state.item.type));
          }
          break;
        }
        case 'permanant_delete': {
          this._showSimpleDialog(TEMPLATE_PERMANANT_DELETE);
          break;
        }
        case 'novault': {
          openVault(this.state.item, false);
          break;
        }
        case 'locked': {
          openVault(this.state.item, true, true);
          break;
        }
        case 'unlock': {
          openVault(this.state.item, true, true, true, false, false);
          break;
        }
        case 'notebook': {
          this.showAddNotebook({item: this.state.item});
          break;
        }
        case 'topic': {
          this.showAddTopic();
          break;
        }
        case 'movenote': {
          moveNoteEvent();
          break;
        }
        case "premium": {
          eSendEvent(eOpenPremiumDialog);
        }
        case "export": {
          eSendEvent(eOpenExportDialog,[this.state.item]);
        }
      }
    }
    this.show = null;
  };

  render() {
    let {colors} = this.props;
    let {actionSheetData, item, simpleDialog} = this.state;
    return (
      <>
        <ActionSheet
          ref={ref => (this.actionSheet = ref)}
          containerStyle={{
            backgroundColor: colors.bg,
            width: DDS.isTab ? 500 : '100%',
            alignSelf: DDS.isTab ? 'flex-end' : 'center',
            marginRight: DDS.isTab ? 12 : null,
            borderRadius: 10,
            marginBottom: DDS.isTab ? 50 : 0,
          }}
          extraScroll={DDS.isTab ? 50 : 0}
          indicatorColor={
            Platform.ios
              ? hexToRGBA(colors.accent + '19')
              : hexToRGBA(colors.shade)
          }
          delayActionSheetDraw={true}
          delayActionSheetDrawTime={10}
          footerAlwaysVisible={DDS.isTab}
          footerHeight={DDS.isTab ? 20 : 10}
          footerStyle={
            DDS.isTab
              ? {
                  borderRadius: 10,
                  backgroundColor: colors.bg,
                }
              : null
          }
          initialOffsetFromBottom={1}
          bounceOnOpen={true}
          gestureEnabled={true}
          onClose={() => {
            this.onActionSheetHide();
          }}>
          <ActionSheetComponent
            item={item}
            setWillRefresh={value => {
              this.willRefresh = true;
            }}
            hasColors={actionSheetData.colors}
            hasTags={actionSheetData.colors}
            overlayColor={
              colors.night ? 'rgba(225,225,225,0.1)' : 'rgba(0,0,0,0.3)'
            }
            rowItems={actionSheetData.rowItems}
            columnItems={actionSheetData.columnItems}
            close={value => {
              if (value) {
                this.show = value;
              }
              this.actionSheet._setModalVisible();
            }}
          />
        </ActionSheet>

        <Dialog
          ref={ref => (this.simpleDialog = ref)}
          item={item}
          colors={colors}
          template={simpleDialog}
        />

        <VaultDialog colors={colors} />

        <MoveNoteDialog
          ref={ref => (this.moveNoteDialog = ref)}
          colors={colors}
        />

        <AddTopicDialog
          ref={ref => (this.addTopicsDialog = ref)}
          toEdit={item.type === 'topic' ? item : null}
          notebookID={
            actionSheetData.extraData
              ? actionSheetData.extraData.notebookID
              : item.id
          }
          colors={colors}
        />
        <AddNotebookDialog
          ref={ref => (this.addNotebooksDialog = ref)}
          toEdit={item}
          colors={colors}
        />
        <PremiumDialog ref={ref => this.premiumDialog = ref}  colors={colors} />

        <LoginDialog colors={colors} ref={ref => (this.loginDialog = ref)} />

        <MergeEditor />

        <ExportDialog/>
      </>
    );
  }
}
