import ReactMarkdown from 'react-markdown';
import React, {
  AnchorHTMLAttributes,
  DetailedHTMLProps,
  ReactElement,
  useMemo,
} from 'react';
import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';
import { CodeProps } from 'react-markdown/lib/ast-to-react';

import QuotedCode from '../components/QuotedCode';
import GeneratedCode from '../components/GeneratedCode';
import FileChip from '../components/FileChip';
import Mixpanel from "../extension/lib/mixpanel";

type Props = {
  repoPath: string;
  repoBranch: string;
  markdown: string;
  repoSource: string;
  isExtension: boolean;
};

const MarkdownWithCode = ({markdown, repoPath, repoBranch, repoSource, isExtension}: Props) => {
  const components = useMemo(() => {
    return {
      a(
        props: Omit<
          DetailedHTMLProps<
            AnchorHTMLAttributes<HTMLAnchorElement>,
            HTMLAnchorElement
          >,
          'ref'
        > &
          ReactMarkdownProps,
      ) {
        const [filePath, lines] = props.href?.split('#') || [];
        const [start, end] =
          lines?.split('-').map((l) => Number(l.slice(1))) || [];

        let fileName: string = '';
        if (props.children?.[0]) {
          if (typeof props.children[0] === 'string') {
            fileName = props.children?.[0];
          }
          const child = props.children[0] as ReactElement;
          if (child?.props && typeof child.props.children?.[0] === 'string') {
            fileName = child.props.children?.[0];
          }
        }

        let fileUrl = `https://${repoSource}.com/${repoPath}/`;
        if (repoSource == "github") {
          fileUrl += `blob/${repoBranch}/${filePath}`;
          if (start) {
            fileUrl += `#L${start}-L${end ?? start}`
          }
        } else if (repoSource == "gitlab") {
          fileUrl += `-/blob/${repoBranch}/${filePath}`;
          if (start) {
            fileUrl += `#L${start}-${end ?? start}`
          }
        }

        const onClickLink = () => {
          if (isExtension) {
            Mixpanel.track("click_code_citation", { fileChip: true });
            window.parent.postMessage(JSON.stringify({message: "redirectToUrl", data: fileUrl}), "*"); // TODO: Restrict origin
          } else {
            window.open(fileUrl, "_blank");
          }
        }

        return (
          <FileChip
            fileName={fileName || filePath || ''}
            skipIcon={!!fileName && fileName !== filePath}
            onClick={onClickLink}
          />
        );
      },
      code({ node, inline, className, children, ...props }: CodeProps) {
        const matchLang = /lang:(\w+)/.exec(className || '') || /language-(\w+)/.exec(className || '');
        const matchType = /language-type:(\w+)/.exec(className || '');
        const matchPath = /path:(.+),/.exec(className || '');
        const matchLines = /lines:(.+)/.exec(className || '');
      
        const code = typeof children[0] === "string" ? children[0].replace(/\n$/, "") : "";
        const lines = matchLines?.[1].split("-").map((l) => Number(l)) || [];
        // colorPreview?
      
        let fileUrl = "";
        if (matchPath?.[1] && matchType?.[1] === "Quoted") {
          fileUrl = `https://${repoSource}.com/${repoPath}/`;
          if (repoSource == "github") {
            fileUrl += `blob/${repoBranch}/${matchPath?.[1]}`;

            if (lines[0]) {
              fileUrl += `#L${lines[0] - 1}-L${lines[1] ?? lines[0] - 1}`
            }
          } else if (repoSource == "gitlab") {
            fileUrl += `-/blob/${repoBranch}/${matchPath?.[1]}`;

            if (lines[0]) {
              fileUrl += `#L${lines[0] - 1}-${lines[1] ?? lines[0] - 1}`
            }
          }
        }

        const onClickLink = () => {
          if (fileUrl) {
            if (isExtension) {
              Mixpanel.track("click_code_citation", { fileChip: false });
              window.parent.postMessage(JSON.stringify({message: "redirectToUrl", data: fileUrl}), "*"); // TODO: Restrict origin
            } else {
              window.open(fileUrl, "_blank");
            }
          }
          
          return null;
        }

        return !inline && (matchType?.[1] || matchLang?.[1]) && typeof children[0] === "string" ? (
          matchType?.[1] === "Quoted" ? (
            <QuotedCode
              code={code}
              language={matchLang?.[1] || ""}
              filePath={matchPath?.[1] || ""}
              startLine={lines[0] ? lines[0] - 1 : null}
              repoSource={repoSource}
              onClick={onClickLink}
            />
          ) : (
            <GeneratedCode code={code} language={matchLang?.[1] || ""} />
          )) : (
            <code {...props} className={className} style={{color: "#FFABFF", fontWeight: 600}}>
              {children}
            </code>
          );
      }
    }
  }, [repoPath, repoSource, repoBranch]);

  return (<ReactMarkdown components={components}>{markdown}</ReactMarkdown>);
}

export default MarkdownWithCode;