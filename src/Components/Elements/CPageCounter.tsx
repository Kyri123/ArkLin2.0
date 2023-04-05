import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import { ButtonGroup } from "react-bootstrap";
import { IPageCounterProps } from "../../Types/PageAddons";
import { LTELoadingButton } from "./AdminLTE/AdminLTE_Buttons";

export default function CPageCounter<T>(Props: IPageCounterProps<T>) {
  const [Page, setPage] = useState(0);
  const PageGroups = useMemo<T[][]>(() => {
    const PerPage = Math.max(1, Props.PerPage || 10);
    const Copy: T[] = structuredClone(Props.Data);
    const Groups: T[][] = [];
    while (Copy.length > 0) {
      Groups.push(Copy.splice(0, PerPage));
    }
    if (!Groups[Page]) {
      setPage(0);
    }

    return Groups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Props.Data]);

  useEffect(() => {
    Props.OnSetPage(PageGroups[Page] || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Page, PageGroups]);

  if (PageGroups.length <= 1) {
    return <></>;
  }

  return (
    <ButtonGroup>
      <LTELoadingButton
        onClick={() => setPage(0)}
        IsLoading={false}
        Disabled={Page <= 0}
      >
        <FontAwesomeIcon icon={"angle-double-left"} />
      </LTELoadingButton>
      <LTELoadingButton
        onClick={() => setPage(Page - 1)}
        IsLoading={false}
        Disabled={PageGroups[Page - 1] === undefined}
      >
        <FontAwesomeIcon icon={"angle-left"} />
      </LTELoadingButton>
      <LTELoadingButton
        IsLoading={false}
        Hide={PageGroups[Page - 3] === undefined}
        Disabled={true}
      >
        ...
      </LTELoadingButton>
      <LTELoadingButton
        className="d-sm-none d-md-block"
        onClick={() => setPage(Page - 2)}
        IsLoading={false}
        Hide={PageGroups[Page - 2] === undefined}
      >
        {Page - 2}
      </LTELoadingButton>
      <LTELoadingButton
        onClick={() => setPage(Page - 1)}
        IsLoading={false}
        Hide={PageGroups[Page - 1] === undefined}
      >
        {Page - 1}
      </LTELoadingButton>
      <LTELoadingButton IsLoading={false} Disabled={true}>
        {Page}
      </LTELoadingButton>
      <LTELoadingButton
        onClick={() => setPage(Page + 1)}
        IsLoading={false}
        Hide={PageGroups[Page + 1] === undefined}
      >
        {Page + 1}
      </LTELoadingButton>
      <LTELoadingButton
        className="d-sm-none d-md-block"
        onClick={() => setPage(Page + 2)}
        IsLoading={false}
        Hide={PageGroups[Page + 2] === undefined}
      >
        {Page + 2}
      </LTELoadingButton>
      <LTELoadingButton
        IsLoading={false}
        Hide={PageGroups[Page + 3] === undefined}
        Disabled={true}
      >
        ...
      </LTELoadingButton>
      <LTELoadingButton
        onClick={() => setPage(Page + 1)}
        IsLoading={false}
        Disabled={PageGroups[Page + 1] === undefined}
      >
        <FontAwesomeIcon icon={"angle-right"} />
      </LTELoadingButton>
      <LTELoadingButton
        onClick={() => setPage(PageGroups.length - 1)}
        IsLoading={false}
        Disabled={Page === PageGroups.length - 1}
      >
        <FontAwesomeIcon icon={"angle-double-right"} />
      </LTELoadingButton>
    </ButtonGroup>
  );
}
