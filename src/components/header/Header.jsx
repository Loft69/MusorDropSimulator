import React, { useState } from 'react';
import "../../styles/header.css";
import DepositModal from "./DepositModal.jsx";

export default function Header({ selectedCase, onBackRaw }) {

    // Заглушка авторизации
    const auth = false;

    // Заглушка данных пользователя
    const username = "Player";
    const avatar = "./images/avatar.png";

    // Баланс монет — можно прибавлять/убавлять через addCoins/removeCoins
    const [coins, setCoins] = useState(1250);
    const [isDepositOpen, setIsDepositOpen] = useState(false);

    function addCoins(amount) {
        setCoins((prev) => prev + amount);
    }

    function removeCoins(amount) {
        setCoins((prev) => Math.max(0, prev - amount));
    }

    function onBack() {
        if (selectedCase == null) return;
        onBackRaw();
    }

    return (
        <div className="css-19gf21q">
            <div className="chakra-stack css-1i8f8ty">
                <div className="chakra-stack css-ppb4ub">
                    <button data-discover="true" type={"button"} onClick={onBack} className="click-button">
                        <img className="chakra-image css-1syfr4j" src="/public/images/logo-CUS07uzv.svg"/>
                    </button>

                    <div className="chakra-stack css-6izshx">
                        <button data-discover="true">
                            <div className="chakra-stack css-me1bio">
                                <img src={"./images/svg1.svg"}/>
                                <p className="css-1ogc5ay">Кейсы</p>
                            </div>
                        </button>

                        <button data-discover="true">
                            <div className="chakra-stack css-me1bio">
                                <img src={"./images/svg2.svg"}/>
                                <p className="css-1ogc5ay">Апгрейд</p>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="chakra-stack css-dnewz7">
                    <div className="chakra-stack css-bdvz9n">
                        <div className="css-3zrys1">
                            <div className="chakra-stack css-14zcihu">
                                <p className="css-16tkj8g">{coins.toLocaleString('ru-RU')}</p>
                                <img src={"./images/svg5.svg"}/>
                            </div>
                        </div>
                        <div className="css-ta6kzn">
                            <button
                                type="button"
                                className="chakra-button css-16mlugo"
                                onClick={() => setIsDepositOpen(true)}
                            >
                                <div className="chakra-stack css-age7l4"><span>Депозит</span>
                                    <img src={"./images/svg4.svg"}/>
                                </div>
                            </button>
                        </div>
                    </div>
                    <button className="click-button" data-discover="true">
                        <img className="chakra-image css-14frued" alt={username} src="https://lh3.googleusercontent.com/a/ACg8ocLfxAXcXg-eQvpNqPU-KS5kn2EUIdvKdv9IIgZ1jgTGmgBmlRw0=s96-c"/>
                    </button>
                </div>


                {/*<div className="chakra-stack css-dnewz7">*/}
                {/*    {!auth ? (*/}
                {/*        <button className="chakra-button css-1xfpdei" type="button">Войти</button>*/}
                {/*    ) : (*/}
                {/*        <div className="header-user">*/}
                {/*            <div className="header-user-info">*/}
                {/*                <div className="header-username">{username}</div>\*/}
                {/*                <div className="header-coins">🪙 {coins}</div>*/}
                {/*            </div>*/}

                {/*            <img className="header-avatar" src={avatar} alt="Аватар"/>*/}
                {/*        </div>*/}
                {/*    )}*/}
                {/*</div>*/}
            </div>

            <DepositModal
                isOpen={isDepositOpen}
                onClose={() => setIsDepositOpen(false)}
                coins={coins}
                onAddCoins={addCoins}
            />
        </div>
    );
}