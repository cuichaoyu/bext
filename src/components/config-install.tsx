import { useMetaDetail } from '@/hooks/use-meta-detail';
import { excuteCompile } from '@/util/compile';
import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  PrimaryButton,
  Separator,
} from '@fluentui/react';
import Form from '@rjsf/fluent-ui';
import { useBoolean, useRequest } from 'ahooks';
import { FC, useState } from 'react';

export const ConfigInstall: FC<{ onInstall: (build?: string) => void }> = ({
  onInstall,
}) => {
  const [dialogVisible, { setTrue: showDialog, setFalse: hideDialog }] =
    useBoolean(false);
  const { currentMeta } = useMetaDetail();

  const [formData, setFormData] = useState(
    () => currentMeta?.defaultConfig || {},
  );
  const [hasError, setHasError] = useState(false);

  const { run: configInstall, loading } = useRequest(
    async () => {
      const { id, name, version, source } = currentMeta!;
      onInstall(
        await excuteCompile({
          meta: {
            id,
            name,
            version,
            source,
            defaultConfig: formData,
          },
        }),
      );
    },
    {
      manual: true,
      onError: () => alert('编译失败，请点击“更多” -> “报告问题”'),
    },
  );

  return (
    <PrimaryButton onClick={showDialog}>
      同意并安装
      <Dialog
        hidden={!dialogVisible}
        onDismiss={hideDialog}
        dialogContentProps={{ type: DialogType.normal, title: '安装选项' }}
        minWidth={400}
      >
        你可以选择使用默认的配置进行安装，不支持自定义配置安装时请选择此种安装方式
        <div className="text-right pb-2">
          <PrimaryButton text="默认安装" onClick={() => onInstall()} />
        </div>
        <Separator>或者自定义配置</Separator>
        <Form
          schema={currentMeta?.configSchema}
          formData={formData}
          onChange={({ formData, errors }) => {
            setFormData(formData);
            setHasError(!!errors.length);
          }}
          omitExtraData
          liveOmit
          liveValidate
        >
          <></>
        </Form>
        <DialogFooter>
          <PrimaryButton
            onClick={configInstall}
            text={loading ? '处理中...' : '使用此配置安装'}
            disabled={hasError}
          />
          <DefaultButton onClick={hideDialog} text="取消" />
        </DialogFooter>
      </Dialog>
    </PrimaryButton>
  );
};
