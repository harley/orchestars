import React from 'react';

const QrLinkCell = (props: any) => {
  const ticketCode = props?.data?.ticketCode || props?.rowData?.ticketCode || props?.value;
  if (!ticketCode) return null;
  const url = `/ticket/${ticketCode}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {url}
    </a>
  );
};

export default QrLinkCell; 