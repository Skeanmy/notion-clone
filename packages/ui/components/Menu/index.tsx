import { forwardRef } from "react";
import { Popover } from 'antd'
import "./index.css";
import notionComponentManager from "../../utils/compStore";
type MenuProps = {
  showMenu: boolean;
  menuPosition: { x: number; y: number };
  onMenuSelect: (type: string) => void;
};

const MenuItem = ({ item, onMenuSelect }) => {
  const { metaData, defaultProps
    , component: Comp } = item;
  const { icon, title, description } = metaData;
  return (
    <Popover content={<Comp blockProps={defaultProps} />} placement="right">
      <div
        className="menu-item"
        onClick={() => {
          onMenuSelect(item);
        }}
      >
        <div className="menu-item-icon">{icon}</div>
        <div className="menu-item-label">{title}</div>
        <div className="menu-item-description">{description}</div>
      </div>
    </Popover>
  );
};

const compList = notionComponentManager.getComponentList();
console.log("compList", compList);
const Menu = forwardRef<HTMLDivElement, MenuProps>((props, ref) => {
  const { menuPosition, onMenuSelect, showMenu } = props;

  if (!showMenu) {
    return null;
  }
  return (
    <div
      className="menu-wrapper"
      ref={ref}
      style={{
        // opacity: showMenu ? 1 : 0,
        top: menuPosition.y,
        left: menuPosition.x,
      }}
    >
      {compList.map((option) => (
        <MenuItem
          key={option.blockType}
          item={option.compData}
          onMenuSelect={onMenuSelect}
        />
      ))}
    </div>
  );
});

export default Menu;
