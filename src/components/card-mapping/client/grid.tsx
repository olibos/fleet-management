import type { ListMappingResponse } from "@/actions/card-mapping/queries/list-mapping/list-mapping-response";
import { AgGridReact } from "@/components/common/client/ag-grid";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { actions } from "astro:actions";
import { useCallback, useState } from "react";
import type { ColDef, CellValueChangedEvent, GetRowIdFunc } from 'ag-grid-community';

type Data = ListMappingResponse[number];

const defaultColDef: ColDef<Data> = {
    sortable: true,
    filter: true,
    flex: 1,
};

const colDefs: ColDef<Data>[] = [
    { field: "company" },
    { field: "cardId" },
    { field: "analyticId", editable: true },
];

const getRowId: GetRowIdFunc<Data> = ({data}) => `${data.cardId}-${data.company}`;

export function Grid() {
    const [client] = useState(() => new QueryClient());
    const { data, refetch } = useQuery({
        queryFn: actions.listCardMapping,
        queryKey: ["listCardMapping"],
    }, client);

    const { mutateAsync: updateCardMapping } = useMutation({
        mutationFn: actions.updateCardMapping,
        mutationKey: ["updateCardMapping"],
    }, client)

    const handleChange = useCallback(async ({newValue, data}: CellValueChangedEvent<Data, string>) => {
        await updateCardMapping({...data, analyticId: newValue || ''});
        await refetch();
    }, []);

    return (
        <div
            className="ag-theme-quartz"
            style={{ height: '100%' }}
        >
            <AgGridReact<ListMappingResponse[number]>
                rowData={data}
                columnDefs={colDefs}
                defaultColDef={defaultColDef}
                onCellValueChanged={handleChange}
                rowSelection="single"
                getRowId={getRowId}
            />
        </div>
    )
}