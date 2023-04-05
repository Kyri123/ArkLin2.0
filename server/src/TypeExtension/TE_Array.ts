export const INDEX_NONE = -1;

export function TE_Array() {
  Array.prototype.IsValidIndex = function (Idx) {
    return Idx > INDEX_NONE && Idx < this.length;
  };

  Array.prototype.RemoveByIndex = function (Idx) {
    if (this.IsValidIndex(Idx)) {
      this.splice(Idx, 1);
    } else {
      SystemLib.DebugLog("[ARRAY] Invalid index", Idx, "of", this.length);
    }
    return this;
  };

  Array.prototype.AddAtIndex = function (Idx, Content) {
    if (this.IsValidIndex(Idx)) {
      this.splice(Idx, 0, Content);
      return this;
    }

    if (Idx >= this.length) {
      this.push(Content);
      return this;
    }

    SystemLib.DebugLog("[ARRAY] Invalid index", Idx, "of", this.length);
    return this;
  };

  Array.prototype.AddFirst = function (Content) {
    this.AddAtIndex(0, Content);
    return this;
  };

  Array.prototype.AddBeforeIndex = function (Idx, Content) {
    if (this.IsValidIndex(Idx)) {
      this.AddAtIndex(Math.max(Idx - 1, 0), Content);
    } else if (Idx === 0) {
      this.AddFirst(Content);
    } else {
      SystemLib.DebugLog("[ARRAY] Invalid index", Idx, "of", this.length);
    }
    return this;
  };

  Array.prototype.AddAfterIndex = function (Idx, Content) {
    if (this.IsValidIndex(Idx) || Idx === this.length) {
      this.AddAtIndex(Math.min(Idx + 1, this.length), Content);
    } else {
      SystemLib.DebugLog("[ARRAY] Invalid index", Idx, "of", this.length);
    }
    return this;
  };

  Array.prototype.RemoveFirst = function (Content) {
    const Index = this.FindIndexOf(Content);

    if (Index > INDEX_NONE) {
      this.RemoveByIndex(Index);
      return true;
    }

    return false;
  };

  Array.prototype.Contains = function (Content) {
    return this.FindIndexOf(Content) > INDEX_NONE;
  };

  Array.prototype.RemoveAll = function (Content) {
    let WasRemoved = false;

    while (this.RemoveFirst(Content)) {
      WasRemoved = true;
    }

    return WasRemoved;
  };

  Array.prototype.FindIndexOf = function (Content) {
    for (let Idx = 0; Idx < this.length; ++Idx) {
      if (this[Idx] === Content) {
        return Idx;
      }
    }

    return INDEX_NONE;
  };

  Array.prototype.IsEmpty = function () {
    return this.length <= 0;
  };

  Array.prototype.Empty = function () {
    this.length = 0;
  };

  Array.prototype.Append = function (OtherArray) {
    this.push(...OtherArray);
  };
}
