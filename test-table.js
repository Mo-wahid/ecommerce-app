import React from "react";
import { createRoot } from "react-dom/client";
import { Table, TableHeader, Column, TableBody, Row, Cell } from "react-aria-components";

const App = () => (
  <Table>
    <TableHeader>
      <Column isRowHeader>Name</Column>
      <Column>Type</Column>
    </TableHeader>
    <TableBody>
      <Row>
        <Cell>File 1</Cell>
        <Cell>PDF</Cell>
      </Row>
    </TableBody>
  </Table>
);

console.log("App loaded");
