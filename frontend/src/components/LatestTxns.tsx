import { ExternalLink, WindArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import Link from "next/link";

export default function LatestTxns() {
  const data = [
    {
      from: "HBLFKPZRBgfQ4JhymFrTcvA9TuwKjX8wcFmxKYNPerdB",
      balance: "2 SOL",
      to: "HBLFKPZRBgfQ4JhymFrTcvA9TuwKjX8wcFmxKYNPerdB",
      sign: "weiru39723972390",
    },
    {
      from: "HBLFKPZRBgfQ4JhymFrTcvA9TuwKjX8wcFmxKYNPerdB",
      balance: "2 SOL",
      to: "fiefu3028",
      sign: "HBLFKPZRBgfQ4JhymFrTcvA9TuwKjX8wcFmxKYNPerdB",
    },
    {
      from: "eifueifuef",
      balance: "2 SOL",
      to: "fiefu3028",
      sign: "weiru39723972390",
    },
    {
      from: "eifueifuef",
      balance: "2 SOL",
      to: "fiefu3028",
      sign: "weiru39723972390",
    },
    {
      from: "eifueifuef",
      balance: "2 SOL",
      to: "fiefu3028",
      sign: "weiru39723972390",
    },
  ];

  return (
    <div className="px-auto pt-3 text-blue-950">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>From</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead align="center" className="text-center">
              To
            </TableHead>
            <TableHead align="right" className="text-end">
              Signature
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item, i) => (
            <TableRow key={i}>
              <TableCell>{item.from}</TableCell>
              <TableCell>{item.balance}</TableCell>
              <TableCell align="center">{item.to}</TableCell>
              <TableCell align="right">
                {" "}
                <Link
                  href={`https://explorer.solana.com/address/${item.sign}?cluster=devnet`}
                  className="text-right"
                >
                  {" "}
                  <span className="flex items-center justify-end gap-2 hover:text-blue-600 text-right">
                    {" "}
                    {item.sign} <ExternalLink width={14} />{" "}
                  </span>{" "}
                </Link>{" "}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
