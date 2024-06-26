type Props = {
    size?: number;
    className?: string;
}
export function Card({size = 24, className}: Props) {
    return (
        <svg
            height={size}
            version="1.1"
            viewBox="0 0 512 512"
            width={size}
            fill="currentColor"
            className={className}
        >
            <g>
                <path
                    d="M452,96H60c-15.5,0-27.9,12.5-28,28l0,0v0.3v263.4v0.3l0,0c0.2,15.5,12.5,28,28,28h392c15.6,0,28-12.7,28-28.3v0V124.3v0
                    C480,108.7,467.6,96,452,96z M77.1,128h357.7c6.9,0,12.1,5.1,13.1,12v20H64v-20.3C65,132.9,70.3,128,77.1,128z M434.9,384H77.1
                    c-6.9,0-12.1-4.9-13.1-11.7V256h384v116C447,378.9,441.7,384,434.9,384z"
                />
                <rect height="16" width="192" x="96" y="304" />
                <rect height="16" width="96" x="96" y="336" />
                <rect height="48" width="64" x="352" y="304" />
            </g>
        </svg>
    );
}